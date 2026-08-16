"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

interface LiveStream {
  id: string;
  user_id: string;
  title: string;
  status: string;
  viewer_count: number;
  started_at: string;
  broadcaster_name?: string;
  broadcaster_avatar?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  display_name?: string;
}

type LiveView = "home" | "start" | "broadcasting" | "watching";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export default function LivePage() {
  const { userId, userProfile } = useAuth();
  const [view, setView] = useState<LiveView>("home");
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamTitle, setStreamTitle] = useState("");
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("new");
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<ReturnType<ReturnType<typeof supabase>["channel"]> | null>(null);
  const chatChannelRef = useRef<ReturnType<ReturnType<typeof supabase>["channel"]> | null>(null);

  // Fetch live streams
  const fetchLiveStreams = useCallback(async () => {
    const client = supabase();
    const { data, error } = await client
      .from("live_streams")
      .select("*")
      .eq("status", "live")
      .order("started_at", { ascending: false });

    if (!error && data) {
      // Fetch broadcaster names
      const streams = await Promise.all(
        data.map(async (stream: LiveStream) => {
          const { data: user } = await client
            .from("users")
            .select("display_name, avatar_url")
            .eq("id", stream.user_id)
            .single();
          return {
            ...stream,
            broadcaster_name: user?.display_name || "Anonymous",
            broadcaster_avatar: user?.avatar_url,
          };
        })
      );
      setLiveStreams(streams);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveStreams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBroadcast();
      leaveStream();
    };
  }, []);

  // Start broadcasting
  const startBroadcast = async () => {
    if (!userId || !streamTitle.trim()) return;

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create stream in database
      const client = supabase();
      const { data, error: dbError } = await client
        .from("live_streams")
        .insert({
          user_id: userId,
          title: streamTitle.trim(),
          status: "live",
        })
        .select()
        .single();

      if (dbError || !data) {
        throw new Error("Failed to create stream");
      }

      setCurrentStream(data);
      setView("broadcasting");

      // Set up signaling channel
      const channel = client.channel(`live:${data.id}`);
      channelRef.current = channel;

      // Listen for viewer offers
      channel.on("broadcast", { event: "viewer-offer" }, async ({ payload }) => {
        const { offer, viewerId } = payload as { offer: RTCSessionDescriptionInit; viewerId: string };
        await handleViewerOffer(data.id, offer, viewerId, stream);
      });

      // Listen for viewer ICE candidates
      channel.on("broadcast", { event: "viewer-candidate" }, async ({ payload }) => {
        const { candidate, viewerId } = payload as { candidate: RTCIceCandidateInit; viewerId: string };
        const pc = peerConnectionsRef.current.get(viewerId);
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      // Track presence for viewer count
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setViewerCount(Object.keys(state).length);
      });

      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, role: "broadcaster" });
        }
      });

      // Set up chat channel
      const chatChannel = client.channel(`chat:${data.id}`);
      chatChannelRef.current = chatChannel;

      chatChannel.on("broadcast", { event: "chat-message" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        setChatMessages(prev => [...prev.slice(-99), msg]);
      });

      await chatChannel.subscribe();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start broadcast";
      if (message.includes("Permission denied") || message.includes("NotAllowed")) {
        setError("Camera and microphone access is required. Please allow permissions.");
      } else {
        setError(message);
      }
    }
  };

  // Handle viewer WebRTC offer
  const handleViewerOffer = async (streamId: string, offer: RTCSessionDescriptionInit, viewerId: string, mediaStream: MediaStream) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionsRef.current.set(viewerId, pc);

    // Add local tracks
    mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "broadcaster-candidate",
          payload: { candidate: event.candidate, viewerId },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        peerConnectionsRef.current.delete(viewerId);
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "broadcaster-answer",
        payload: { answer, viewerId },
      });
    }
  };

  // Stop broadcasting
  const stopBroadcast = async () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;

    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    if (channelRef.current) {
      await channelRef.current.untrack();
      supabase().removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (chatChannelRef.current) {
      supabase().removeChannel(chatChannelRef.current);
      chatChannelRef.current = null;
    }

    if (currentStream) {
      const client = supabase();
      await client
        .from("live_streams")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", currentStream.id);
      setCurrentStream(null);
    }

    setView("home");
    setChatMessages([]);
    setViewerCount(0);
  };

  // Join a stream as viewer
  const joinStream = async (stream: LiveStream) => {
    if (!userId) return;

    try {
      setError(null);
      setCurrentStream(stream);
      setView("watching");
      setChatMessages([]);

      const client = supabase();

      // Set up signaling channel
      const channel = client.channel(`live:${stream.id}`);
      channelRef.current = channel;

      // Listen for broadcaster answer
      channel.on("broadcast", { event: "broadcaster-answer" }, async ({ payload }) => {
        const { answer, viewerId } = payload as { answer: RTCSessionDescriptionInit; viewerId: string };
        if (viewerId === userId) {
          const pc = peerConnectionsRef.current.get("broadcaster");
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        }
      });

      // Listen for broadcaster ICE candidates
      channel.on("broadcast", { event: "broadcaster-candidate" }, async ({ payload }) => {
        const { candidate, viewerId } = payload as { candidate: RTCIceCandidateInit; viewerId: string };
        if (viewerId === userId) {
          const pc = peerConnectionsRef.current.get("broadcaster");
          if (pc && candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      });

      // Track presence
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setViewerCount(Object.keys(state).length);
      });

      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, role: "viewer" });

          // Create peer connection to broadcaster
          const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
          peerConnectionsRef.current.set("broadcaster", pc);

          pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };

          pc.onicecandidate = (event) => {
            if (event.candidate && channelRef.current) {
              channelRef.current.send({
                type: "broadcast",
                event: "viewer-candidate",
                payload: { candidate: event.candidate, viewerId: userId },
              });
            }
          };

          pc.onconnectionstatechange = () => {
            setConnectionState(pc.connectionState);
          };

          // Create and send offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          channel.send({
            type: "broadcast",
            event: "viewer-offer",
            payload: { offer, viewerId: userId },
          });
        }
      });

      // Set up chat channel
      const chatChannel = client.channel(`chat:${stream.id}`);
      chatChannelRef.current = chatChannel;

      chatChannel.on("broadcast", { event: "chat-message" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        setChatMessages(prev => [...prev.slice(-99), msg]);
      });

      await chatChannel.subscribe();

      // Load recent chat messages
      const { data: recentMessages } = await client
        .from("live_chat_messages")
        .select("*")
        .eq("stream_id", stream.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (recentMessages) {
        const messages = await Promise.all(
          recentMessages.map(async (msg: ChatMessage) => {
            const { data: user } = await client
              .from("users")
              .select("display_name")
              .eq("id", msg.user_id)
              .single();
            return { ...msg, display_name: user?.display_name || "Anonymous" };
          })
        );
        setChatMessages(messages);
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join stream");
    }
  };

  // Leave stream
  const leaveStream = async () => {
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    if (channelRef.current) {
      supabase().removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (chatChannelRef.current) {
      supabase().removeChannel(chatChannelRef.current);
      chatChannelRef.current = null;
    }

    setCurrentStream(null);
    setView("home");
    setChatMessages([]);
    setViewerCount(0);
    setConnectionState("new");
  };

  // Send chat message
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !currentStream || !userId) return;

    const message = chatInput.trim();
    setChatInput("");

    const displayName = userProfile?.display_name || "Anonymous";
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: userId,
      message,
      created_at: new Date().toISOString(),
      display_name: displayName,
    };

    // Broadcast to others
    if (chatChannelRef.current) {
      chatChannelRef.current.send({
        type: "broadcast",
        event: "chat-message",
        payload: msg,
      });
    }

    // Save to database
    const client = supabase();
    await client.from("live_chat_messages").insert({
      stream_id: currentStream.id,
      user_id: userId,
      message,
    });

    // Add to local state
    setChatMessages(prev => [...prev.slice(-99), msg]);
  };

  // Toggle microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOff(!videoTrack.enabled);
      }
    }
  };

  // Flip camera
  const flipCamera = async () => {
    if (!localStreamRef.current) return;

    const newFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(newFacing);

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace track in all peer connections
      peerConnectionsRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track === oldVideoTrack);
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      });

      oldVideoTrack.stop();
      localStreamRef.current.removeTrack(oldVideoTrack);
      localStreamRef.current.addTrack(newVideoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch {
      // Failed to flip camera
    }
  };

  // Send reaction
  const sendReaction = (emoji: string) => {
    if (chatChannelRef.current && currentStream) {
      chatChannelRef.current.send({
        type: "broadcast",
        event: "reaction",
        payload: { emoji, userId },
      });
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #15261d 0%, #1a2e23 50%, #15261d 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", top: "-20%", right: "-10%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(239, 68, 68, 0.04) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 20px 60px", position: "relative", zIndex: 1 }}>

        {/* HOME - Browse live streams */}
        {view === "home" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{
              fontSize: 36, fontWeight: 100, letterSpacing: "16px", textTransform: "uppercase",
              background: "linear-gradient(135deg, #ef4444, #f97316, #ef4444)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              margin: "0 0 12px", textAlign: "center",
            }}>
              LIVE
            </h1>
            <p style={{ fontSize: 13, color: "rgba(224, 245, 232, 0.35)", textAlign: "center", margin: "0 0 48px", lineHeight: 1.6 }}>
              Real people. Right now.
            </p>

            {/* Start Live button */}
            {userId && (
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <button onClick={() => setView("start")} style={{
                  padding: "14px 32px", borderRadius: 12,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "none", color: "white", fontSize: 14, fontWeight: 500,
                  cursor: "pointer", boxShadow: "0 0 30px rgba(239, 68, 68, 0.3)",
                  letterSpacing: "1px", textTransform: "uppercase",
                }}>
                  Start Live
                </button>
              </div>
            )}

            {/* Live streams */}
            {loading ? (
              <p style={{ textAlign: "center", color: "rgba(224, 245, 232, 0.3)", fontSize: 13 }}>Finding live streams...</p>
            ) : liveStreams.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📡</div>
                <p style={{ fontSize: 14, color: "rgba(224, 245, 232, 0.4)", marginBottom: 8 }}>
                  It&apos;s quiet here right now.
                </p>
                <p style={{ fontSize: 12, color: "rgba(224, 245, 232, 0.25)" }}>
                  Be the first to go live.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {liveStreams.map(stream => (
                  <motion.button
                    key={stream.id}
                    onClick={() => joinStream(stream)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: "rgba(21, 38, 29, 0.75)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      borderRadius: 16,
                      padding: 20,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#ef4444",
                        boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                        animation: "pulse 2s ease-in-out infinite",
                      }} />
                      <span style={{
                        fontSize: 9, color: "#ef4444", fontWeight: 600,
                        letterSpacing: "2px", textTransform: "uppercase",
                      }}>LIVE</span>
                      <span style={{ fontSize: 10, color: "rgba(224, 245, 232, 0.3)", marginLeft: "auto" }}>
                        {stream.viewer_count} watching
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: "#e0f5e8", fontWeight: 500, marginBottom: 8 }}>
                      {stream.title}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(224, 245, 232, 0.4)" }}>
                      {stream.broadcaster_name}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* START - Set up broadcast */}
        {view === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setView("home")} style={{
              fontSize: 10, color: "rgba(0, 255, 136, 0.5)", background: "none", border: "none",
              cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
            }}>← Back</button>

            <h2 style={{ fontSize: 18, fontWeight: 300, color: "#e0f5e8", marginBottom: 32, textAlign: "center", letterSpacing: "4px", textTransform: "uppercase" }}>
              Start Live
            </h2>

            <div style={{
              maxWidth: 400, margin: "0 auto",
              background: "rgba(21, 38, 29, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0, 255, 136, 0.08)",
              borderRadius: 16,
              padding: 24,
            }}>
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Stream Title
              </label>
              <input
                value={streamTitle}
                onChange={e => setStreamTitle(e.target.value)}
                placeholder="What are you streaming?"
                style={{
                  width: "100%", background: "rgba(0, 255, 136, 0.04)",
                  border: "1px solid rgba(0, 255, 136, 0.15)",
                  borderRadius: 8, padding: "12px 16px", color: "#e0f5e8",
                  fontSize: 14, outline: "none", marginBottom: 24, boxSizing: "border-box",
                }}
              />

              {error && (
                <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 16, textAlign: "center" }}>{error}</p>
              )}

              <button onClick={startBroadcast} disabled={!streamTitle.trim()} style={{
                width: "100%", padding: "14px", borderRadius: 10,
                background: streamTitle.trim() ? "linear-gradient(135deg, #ef4444, #dc2626)" : "rgba(239, 68, 68, 0.2)",
                border: "none", color: streamTitle.trim() ? "white" : "rgba(255,255,255,0.3)",
                fontSize: 14, fontWeight: 500, cursor: streamTitle.trim() ? "pointer" : "default",
                letterSpacing: "1px", textTransform: "uppercase",
              }}>
                Go Live
              </button>
            </div>
          </motion.div>
        )}

        {/* BROADCASTING - Live stream controls */}
        {view === "broadcasting" && currentStream && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "fixed", inset: 0, zIndex: 50 }}>
            {/* Video */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover",
                transform: cameraFacing === "user" ? "scaleX(-1)" : "none",
              }}
            />

            {/* Overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)" }} />

            {/* Top bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  padding: "4px 10px", borderRadius: 6,
                  background: "rgba(239, 68, 68, 0.8)",
                  fontSize: 10, fontWeight: 600, color: "white",
                  letterSpacing: "2px", textTransform: "uppercase",
                }}>LIVE</div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                  {viewerCount} watching
                </span>
              </div>
              <button onClick={stopBroadcast} style={{
                padding: "8px 16px", borderRadius: 8,
                background: "rgba(239, 68, 68, 0.8)",
                border: "none", color: "white", fontSize: 12,
                cursor: "pointer", fontWeight: 500,
              }}>End Live</button>
            </div>

            {/* Bottom controls */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "20px",
            }}>
              {/* Chat */}
              <div style={{
                maxHeight: 200, overflowY: "auto", marginBottom: 16,
                padding: "0 4px",
              }}>
                {chatMessages.slice(-10).map(msg => (
                  <div key={msg.id} style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                      {msg.display_name}:{" "}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{msg.message}</span>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={toggleMic} style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: micMuted ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.2)",
                  border: "none", color: "white", fontSize: 18,
                  cursor: "pointer", backdropFilter: "blur(8px)",
                }}>{micMuted ? "🔇" : "🎤"}</button>
                <button onClick={toggleCamera} style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: cameraOff ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.2)",
                  border: "none", color: "white", fontSize: 18,
                  cursor: "pointer", backdropFilter: "blur(8px)",
                }}>{cameraOff ? "📷" : "📹"}</button>
                <button onClick={flipCamera} style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  border: "none", color: "white", fontSize: 18,
                  cursor: "pointer", backdropFilter: "blur(8px)",
                }}>🔄</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* WATCHING - View a live stream */}
        {view === "watching" && currentStream && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "fixed", inset: 0, zIndex: 50 }}>
            {/* Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover",
                background: "#000",
              }}
            />

            {/* Connection state */}
            {connectionState !== "connected" && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.7)",
              }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                  {connectionState === "connecting" || connectionState === "new" ? "Connecting..." :
                   connectionState === "disconnected" ? "Reconnecting..." :
                   connectionState === "failed" ? "Connection lost" : "Loading..."}
                </p>
              </div>
            )}

            {/* Overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)" }} />

            {/* Top bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  padding: "4px 10px", borderRadius: 6,
                  background: "rgba(239, 68, 68, 0.8)",
                  fontSize: 10, fontWeight: 600, color: "white",
                  letterSpacing: "2px", textTransform: "uppercase",
                }}>LIVE</div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                  {viewerCount} watching
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={leaveStream} style={{
                  padding: "8px 16px", borderRadius: 8,
                  background: "rgba(255,255,255,0.2)",
                  border: "none", color: "white", fontSize: 12,
                  cursor: "pointer", backdropFilter: "blur(8px)",
                }}>Leave</button>
              </div>
            </div>

            {/* Stream info */}
            <div style={{
              position: "absolute", top: 60, left: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "white", marginBottom: 4 }}>
                {currentStream.title}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {currentStream.broadcaster_name}
              </div>
            </div>

            {/* Bottom - Chat and reactions */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "20px",
            }}>
              {/* Reactions */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "center" }}>
                {["❤️", "🔥", "👏", "😮", "✨"].map(emoji => (
                  <button key={emoji} onClick={() => sendReaction(emoji)} style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    border: "none", fontSize: 18,
                    cursor: "pointer", backdropFilter: "blur(8px)",
                  }}>{emoji}</button>
                ))}
              </div>

              {/* Chat */}
              <div style={{
                maxHeight: 150, overflowY: "auto", marginBottom: 12,
                padding: "0 4px",
              }}>
                {chatMessages.slice(-8).map(msg => (
                  <div key={msg.id} style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                      {msg.display_name}:{" "}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{msg.message}</span>
                  </div>
                ))}
              </div>

              {/* Chat input */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                  placeholder="Say something..."
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8, padding: "10px 14px", color: "white",
                    fontSize: 12, outline: "none",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <button onClick={sendChatMessage} style={{
                  padding: "10px 16px", borderRadius: 8,
                  background: "rgba(255,255,255,0.2)",
                  border: "none", color: "white", fontSize: 12,
                  cursor: "pointer",
                }}>Send</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
