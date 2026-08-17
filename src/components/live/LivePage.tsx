"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { LiveCameraPipeline } from "@/lib/live-camera";
import { getFilter } from "@/lib/live-filters";
import { sanitizeMessage, checkMessage, rateLimitReaction } from "@/lib/chat-safety";
import FilterPicker from "@/components/live/FilterPicker";
import LiveChatOverlay from "@/components/live/LiveChatOverlay";
import {
  LiveStream,
  LiveChatMessage,
  ChatRow,
  FloatingReaction,
  LiveView,
  LiveConnection,
  ActionSheetAction,
} from "@/components/live/types";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const REACTION_EMOJIS = ["♡", "✨", "🫶", "🔥"];
const REPORT_REASONS = ["Spam", "Harassment", "Inappropriate", "Hate speech", "Other"];
const MAX_CHAT_LOG = 120;
const MAX_FLOATING_REACTIONS = 24;

interface ModeratorEntry {
  user_id: string;
}

interface BannedWordRow {
  word: string;
}

export default function LivePage() {
  const { userId, userProfile, isAdmin } = useAuth();
  const [view, setView] = useState<LiveView>("home");
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamTitle, setStreamTitle] = useState("");
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [filterId, setFilterId] = useState("natural");
  const [previewActive, setPreviewActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<(ChatRow & { ts: number })[]>([]);
  const [replyTarget, setReplyTarget] = useState<LiveChatMessage | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<LiveChatMessage | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<LiveConnection>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ kind: "stream" | "comment"; msg?: LiveChatMessage } | null>(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [slowMode, setSlowMode] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [moderators, setModerators] = useState<string[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pipelineRef = useRef<LiveCameraPipeline | null>(null);
  const broadcastStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const broadcasterPcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof supabase>["channel"]> | null>(null);
  const chatChannelRef = useRef<ReturnType<ReturnType<typeof supabase>["channel"]> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewerCountRef = useRef(0);
  const lastSentAtRef = useRef<number | null>(null);
  const lastReactionAtRef = useRef<number | null>(null);
  const myRecentRef = useRef<string[]>([]);
  const blockedUsersRef = useRef<Set<string>>(new Set());
  const mutedUsersRef = useRef<Map<string, number>>(new Map());
  const hiddenUsersRef = useRef<Set<string>>(new Set());
  const bannedWordsRef = useRef<string[]>([]);
  const reactionSeqRef = useRef(0);
  const joinNoticeSeqRef = useRef(0);
  const lastNoticeAtRef = useRef(0);
  const viewRef = useRef<LiveView>("home");
  const stopBroadcastRef = useRef<() => void>(() => {});
  const leaveStreamRef = useRef<() => void>(() => {});

  // -------------------------------------------------------------------------
  // Small helpers (defined first, used everywhere)
  // -------------------------------------------------------------------------
  const flash = useCallback((text: string) => {
    setChatError(text);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setChatError(null), 3500);
  }, []);

  const addChatMessage = useCallback((msg: LiveChatMessage) => {
    if (!msg || !msg.id) return;
    if (blockedUsersRef.current.has(msg.user_id)) return;
    const muteUntil = mutedUsersRef.current.get(msg.user_id);
    if (muteUntil && muteUntil > Date.now()) return;
    setChatLog((prev) => {
      if (prev.some((r) => r.kind === "msg" && r.msg.id === msg.id)) return prev;
      const next = [...prev, { kind: "msg" as const, msg, ts: new Date(msg.created_at || Date.now()).getTime() }];
      return next.length > MAX_CHAT_LOG ? next.slice(next.length - MAX_CHAT_LOG) : next;
    });
  }, []);

  const addJoinNotice = useCallback((rawName?: string) => {
    const now = Date.now();
    if (now - lastNoticeAtRef.current < 800) return;
    lastNoticeAtRef.current = now;
    const name = rawName || "Someone";
    setChatLog((prev) => {
      const next = [
        ...prev,
        { kind: "notice" as const, id: `join-${++joinNoticeSeqRef.current}`, text: `${name} joined the live`, ts: now },
      ];
      return next.length > MAX_CHAT_LOG ? next.slice(next.length - MAX_CHAT_LOG) : next;
    });
  }, []);

  const presenceName = () => {
    if (userProfile?.display_name) return userProfile.display_name;
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("elovayne-visitor-name");
      return stored && stored.trim() ? stored.trim().slice(0, 40) : null;
    } catch {
      return null;
    }
  };

  const removeMessageLocal = useCallback((id: string) => {
    setChatLog((prev) => prev.filter((r) => r.kind !== "msg" || r.msg.id !== id));
    setPinnedMessage((prev) => (prev?.id === id ? null : prev));
  }, []);

  const handleReactionEvent = useCallback((payload: unknown) => {
    const p = payload as { emoji?: string };
    if (!p?.emoji) return;
    const id = `r-${++reactionSeqRef.current}`;
    const x = 60 + Math.random() * 30;
    setReactions((prev) => [...prev.slice(-MAX_FLOATING_REACTIONS + 1), { id, emoji: p.emoji as string, x }]);
    window.setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3600);
  }, []);

  const handleModerationEvent = useCallback((payload: unknown) => {
    const p = payload as { type?: string; userId?: string };
    if (!p?.userId) return;
    if (p.type === "block") {
      blockedUsersRef.current.add(p.userId);
      setChatLog((prev) => prev.filter((r) => r.kind !== "msg" || r.msg.user_id !== p.userId));
    } else if (p.type === "mute") {
      mutedUsersRef.current.set(p.userId, Date.now() + 15 * 60 * 1000);
    }
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    if (!channelRef.current || !currentStream) return;
    if (!rateLimitReaction(Date.now(), lastReactionAtRef.current)) return;
    lastReactionAtRef.current = Date.now();
    channelRef.current.send({
      type: "broadcast",
      event: "reaction",
      payload: { emoji, userId },
    });
    handleReactionEvent({ emoji });
  }, [currentStream, userId, handleReactionEvent]);

  // -------------------------------------------------------------------------
  // Data effects
  // -------------------------------------------------------------------------
  useEffect(() => { viewRef.current = view; }, [view]);

  const fetchLiveStreams = useCallback(async () => {
    const client = supabase();
    const { data, error } = await client
      .from("live_streams")
      .select("*")
      .eq("status", "live")
      .order("started_at", { ascending: false });

    if (error || !data) return;

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
    setLiveStreams(streams.filter((s) => !hiddenUsersRef.current.has(s.user_id)));
    setLoading(false);

    setCurrentStream((prev) => {
      if (prev && viewRef.current === "watching" && !streams.some((s) => s.id === prev.id)) {
        setConnectionStatus("ended");
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveStreams]);

  // Hide the global nav toggle while in fullscreen live views
  useEffect(() => {
    const isFullscreen = view === "broadcasting" || view === "watching";
    document.body.classList.toggle("live-fullscreen", isFullscreen);
    return () => document.body.classList.remove("live-fullscreen");
  }, [view]);

  // Load moderation reference data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const client = supabase();
      const [{ data: words }, { data: mods }] = await Promise.all([
        client.from("live_banned_words").select("word"),
        client.from("live_moderators").select("user_id"),
      ]);
      if (cancelled) return;
      bannedWordsRef.current = (words as BannedWordRow[] | null)?.map((w) => w.word) || [];
      setModerators((mods as ModeratorEntry[] | null)?.map((m) => m.user_id) || []);
    })();
    return () => { cancelled = true; };
  }, []);

  // Mobile keyboard offset (visual viewport)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const open = window.innerHeight - vv.height > 80;
      setKeyboardOffset(open ? window.innerHeight - vv.height : 0);
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBroadcastRef.current?.();
      leaveStreamRef.current?.();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Camera + filters
  // -------------------------------------------------------------------------
  const startPreview = async () => {
    setError(null);
    try {
      if (!pipelineRef.current) pipelineRef.current = new LiveCameraPipeline();
      if (!pipelineRef.current.rawStream) {
        await pipelineRef.current.startCamera({ facingMode: cameraFacing, audio: true });
      }
      const out = await pipelineRef.current.applyFilter(getFilter(filterId));
      if (localVideoRef.current) localVideoRef.current.srcObject = out;
      setPreviewActive(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (/notallowed|permission/i.test(message)) {
        setError("Camera and microphone access is required. Please allow permissions.");
      } else {
        setError("Couldn't open your camera. Check your device permissions.");
      }
    }
  };

  const changeFilter = async (id: string) => {
    setFilterId(id);
    setFilterPanelOpen(false);
    if (!pipelineRef.current?.rawStream) return;
    const out = await pipelineRef.current.applyFilter(getFilter(id));
    if (localVideoRef.current) localVideoRef.current.srcObject = out;
    if (view === "broadcasting" && currentStream) {
      const videoTrack = pipelineRef.current.getVideoTrack();
      peerConnectionsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && videoTrack) sender.replaceTrack(videoTrack);
      });
      supabase().from("live_streams").update({ filter: id }).eq("id", currentStream.id);
    }
  };

  const buildBroadcastStream = (): MediaStream => {
    const out = new MediaStream();
    const videoTrack = pipelineRef.current?.getVideoTrack();
    if (videoTrack) out.addTrack(videoTrack);
    const audioTrack = pipelineRef.current?.rawStream?.getAudioTracks()[0];
    if (audioTrack) out.addTrack(audioTrack);
    return out;
  };

  const flipCamera = async () => {
    const newFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(newFacing);
    if (!pipelineRef.current?.rawStream) return;
    try {
      const raw = pipelineRef.current.rawStream;
      raw.getTracks().forEach((t) => t.stop());
      await pipelineRef.current.startCamera({ facingMode: newFacing, audio: true });
      const out = await pipelineRef.current.applyFilter(getFilter(filterId));
      if (localVideoRef.current) localVideoRef.current.srcObject = out;
      if (view === "broadcasting" && currentStream) {
        const broadcastStream = buildBroadcastStream();
        const newVideoTrack = broadcastStream.getVideoTracks()[0];
        const newAudioTrack = broadcastStream.getAudioTracks()[0];
        peerConnectionsRef.current.forEach((pc) => {
          pc.getSenders().forEach((sender) => {
            if (sender.track?.kind === "video" && newVideoTrack) sender.replaceTrack(newVideoTrack);
            if (sender.track?.kind === "audio" && newAudioTrack) sender.replaceTrack(newAudioTrack);
          });
        });
      }
    } catch {
      setError("Couldn't switch the camera.");
    }
  };

  const toggleMic = () => {
    const audioTrack = pipelineRef.current?.rawStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicMuted(!audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = pipelineRef.current?.rawStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOff(!videoTrack.enabled);
    }
  };

  // -------------------------------------------------------------------------
  // Session lifecycle (broadcast + watch)
  // -------------------------------------------------------------------------
  const teardownSession = useCallback(() => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    if (broadcasterPcRef.current) {
      broadcasterPcRef.current.close();
      broadcasterPcRef.current = null;
    }
    if (channelRef.current) {
      supabase().removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (chatChannelRef.current) {
      supabase().removeChannel(chatChannelRef.current);
      chatChannelRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    setChatLog([]);
    setPinnedMessage(null);
    setViewerCount(0);
    viewerCountRef.current = 0;
    setReplyTarget(null);
    setChatInput("");
    setChatError(null);
    myRecentRef.current = [];
  }, []);

  const handleViewerOffer = async (offer: RTCSessionDescriptionInit, viewerId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionsRef.current.set(viewerId, pc);

    const stream = broadcastStreamRef.current || pipelineRef.current?.rawStream;
    if (stream) stream.getTracks().forEach((track) => pc.addTrack(track, stream));

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
      if (pc.connectionState === "connected") setConnectionStatus("live");
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        peerConnectionsRef.current.delete(viewerId);
        pc.close();
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

  const startBroadcast = async () => {
    if (!userId || !streamTitle.trim()) return;
    try {
      setError(null);
      if (!pipelineRef.current) pipelineRef.current = new LiveCameraPipeline();
      if (!pipelineRef.current.rawStream) {
        await pipelineRef.current.startCamera({ facingMode: cameraFacing, audio: true });
      }
      const out = await pipelineRef.current.applyFilter(getFilter(filterId));
      if (localVideoRef.current) localVideoRef.current.srcObject = out;
      broadcastStreamRef.current = buildBroadcastStream();

      const client = supabase();
      const { data, error: dbError } = await client
        .from("live_streams")
        .insert({
          user_id: userId,
          title: streamTitle.trim(),
          status: "live",
          filter: filterId,
        })
        .select()
        .single();

      if (dbError || !data) throw new Error("Failed to create stream");

      setCurrentStream(data);
      setSlowMode(!!data.slow_mode);
      setChatLog([]);
      setView("broadcasting");
setConnectionStatus("live");

      const channelDisposed = false;
      const channel = client.channel(`live:${data.id}`);
      channelRef.current = channel;
      channel.on("broadcast", { event: "viewer-offer" }, async ({ payload }) => {
        const { offer, viewerId } = payload as { offer: RTCSessionDescriptionInit; viewerId: string };
        await handleViewerOffer(offer, viewerId);
      });
      channel.on("broadcast", { event: "viewer-candidate" }, async ({ payload }) => {
        const { candidate, viewerId } = payload as { candidate: RTCIceCandidateInit; viewerId: string };
        const pc = peerConnectionsRef.current.get(viewerId);
        if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });
      channel.on("broadcast", { event: "reaction" }, ({ payload }) => handleReactionEvent(payload));
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Math.max(0, Object.keys(state).length - 1);
        viewerCountRef.current = count;
        setViewerCount(count);
      });
      channel.on("presence", { event: "join" }, ({ newPresences }) => {
        newPresences.forEach((p) => addJoinNotice((p as { name?: string }).name));
      });
      channel.on("subscribe", () => {
        // Channel successfully subscribed - reset any previous disconnect state
        setConnectionStatus("live");
      });
      channel.on("disconnect", () => {
        // Channel disconnected - show reconnecting status, but don't immediately end the stream
        if (!channelDisposed) {
          setConnectionStatus("reconnecting");
        }
      });
      channel.on("subscribe-error", () => {
        setConnectionStatus("failed");
      });
      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED" && !channelDisposed) {
          await channel.track({ user_id: userId, role: "broadcaster", name: presenceName() });
          setConnectionStatus("live");
        }
      });

      const chatChannel = client.channel(`chat:${data.id}`);
      chatChannelRef.current = chatChannel;
      chatChannel.on("broadcast", { event: "chat-message" }, ({ payload }) => addChatMessage(payload));
      chatChannel.on("broadcast", { event: "message-removed" }, ({ payload }) => removeMessageLocal(payload.id));
      chatChannel.on("broadcast", { event: "pin" }, ({ payload }) => setPinnedMessage(payload.msg));
      chatChannel.on("broadcast", { event: "unpin" }, () => setPinnedMessage(null));
      chatChannel.on("broadcast", { event: "reaction" }, ({ payload }) => handleReactionEvent(payload));
      chatChannel.on("broadcast", { event: "moderation" }, ({ payload }) => handleModerationEvent(payload));
      await chatChannel.subscribe();

      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = setInterval(async () => {
        await client
          .from("live_streams")
          .update({ viewer_count: viewerCountRef.current, heartbeat_at: new Date().toISOString() })
          .eq("id", data.id);
      }, 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (/notallowed|permission/i.test(message)) {
        setError("Camera and microphone access is required. Please allow permissions.");
      } else {
        setError("Couldn't start your live stream. Please try again.");
      }
    }
  };

  const stopBroadcast = async () => {
    teardownSession();
    pipelineRef.current?.stop();
    pipelineRef.current = null;
    broadcastStreamRef.current = null;

    if (currentStream) {
      const client = supabase();
      await client
        .from("live_streams")
        .update({ status: "ended", ended_at: new Date().toISOString(), ended_reason: "ended" })
        .eq("id", currentStream.id);
      setCurrentStream(null);
    }

    setView("home");
    setPreviewActive(false);
    setFilterPanelOpen(false);
    setMicMuted(false);
    setCameraOff(false);
    setChatHidden(false);
    fetchLiveStreams();
  };

  const joinStream = async (stream: LiveStream) => {
    if (!userId) return;
    try {
      setError(null);
      teardownSession();
      setCurrentStream(stream);
      setSlowMode(!!stream.slow_mode);
      setView("watching");
      setConnectionStatus("connecting");
      setChatHidden(false);

      const client = supabase();

      const channel = client.channel(`live:${stream.id}`);
      channelRef.current = channel;

      channel.on("broadcast", { event: "broadcaster-answer" }, async ({ payload }) => {
        const { answer, viewerId } = payload as { answer: RTCSessionDescriptionInit; viewerId: string };
        if (viewerId === userId && broadcasterPcRef.current) {
          await broadcasterPcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });
      channel.on("broadcast", { event: "broadcaster-candidate" }, async ({ payload }) => {
        const { candidate, viewerId } = payload as { candidate: RTCIceCandidateInit; viewerId: string };
        if (viewerId === userId && broadcasterPcRef.current && candidate) {
          await broadcasterPcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });
      channel.on("broadcast", { event: "reaction" }, ({ payload }) => handleReactionEvent(payload));
      channel.on("broadcast", { event: "moderation" }, ({ payload }) => handleModerationEvent(payload));
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Math.max(0, Object.keys(state).length - 1);
        viewerCountRef.current = count;
        setViewerCount(count);
        const broadcasterPresent = Object.values(state).some((p) => (p as { role?: string }).role === "broadcaster");
        if (!broadcasterPresent) setConnectionStatus("ended");
      });
      channel.on("presence", { event: "join" }, ({ newPresences }) => {
        newPresences.forEach((p) => addJoinNotice((p as { name?: string }).name));
      });
      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, role: "viewer", name: presenceName() });

          const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
          broadcasterPcRef.current = pc;
          pc.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
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
            const s = pc.connectionState;
            if (s === "connected") setConnectionStatus("live");
            else if (s === "disconnected") setConnectionStatus("reconnecting");
            else if (s === "failed") setConnectionStatus("weak");
            else if (s === "connecting") setConnectionStatus("connecting");
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: "broadcast",
            event: "viewer-offer",
            payload: { offer, viewerId: userId },
          });
        }
      });

      const chatChannel = client.channel(`chat:${stream.id}`);
      chatChannelRef.current = chatChannel;
      chatChannel.on("broadcast", { event: "chat-message" }, ({ payload }) => addChatMessage(payload));
      chatChannel.on("broadcast", { event: "message-removed" }, ({ payload }) => removeMessageLocal(payload.id));
      chatChannel.on("broadcast", { event: "pin" }, ({ payload }) => setPinnedMessage(payload.msg));
      chatChannel.on("broadcast", { event: "unpin" }, () => setPinnedMessage(null));
      chatChannel.on("broadcast", { event: "reaction" }, ({ payload }) => handleReactionEvent(payload));
      chatChannel.on("broadcast", { event: "moderation" }, ({ payload }) => handleModerationEvent(payload));
      await chatChannel.subscribe();

      const { data: recent } = await client
        .from("live_chat_messages")
        .select("*")
        .eq("stream_id", stream.id)
        .eq("deleted", false)
        .order("created_at", { ascending: true })
        .limit(30);

      if (recent && recent.length) {
        const ids = Array.from(new Set((recent as LiveChatMessage[]).map((m) => m.user_id)));
        const { data: users } = await client.from("users").select("id, display_name, avatar_url").in("id", ids);
        const nameMap = new Map((users || []).map((u) => [u.id, u]));
        const hydrated = (recent as LiveChatMessage[]).map((m) => ({
          ...m,
          display_name: (nameMap.get(m.user_id) as { display_name?: string } | undefined)?.display_name || "Anonymous",
          avatar_url: (nameMap.get(m.user_id) as { avatar_url?: string | null } | undefined)?.avatar_url || null,
        }));
        setChatLog(hydrated.map((m) => ({ kind: "msg" as const, msg: m, ts: new Date(m.created_at).getTime() })));
      }

      if (stream.pinned_message_id) {
        const { data: pinned } = await client
          .from("live_chat_messages")
          .select("*")
          .eq("id", stream.pinned_message_id)
          .maybeSingle();
        if (pinned) {
          const { data: user } = await client
            .from("users")
            .select("display_name")
            .eq("id", pinned.user_id)
            .single();
          setPinnedMessage({ ...(pinned as LiveChatMessage), display_name: user?.display_name || "Anonymous" });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join stream");
    }
  };

  const leaveStream = () => {
    teardownSession();
    setCurrentStream(null);
    setView("home");
  };

  const switchStream = (direction: 1 | -1) => {
    const index = liveStreams.findIndex((s) => s.id === currentStream?.id);
    const next = index + direction;
    if (next < 0 || next >= liveStreams.length) return;
    const target = liveStreams[next];
    if (target && !hiddenUsersRef.current.has(target.user_id)) joinStream(target);
  };

  // Assign the latest stop/leave so the unmount cleanup always has them
  useEffect(() => {
    stopBroadcastRef.current = stopBroadcast;
    leaveStreamRef.current = leaveStream;
  });

  // -------------------------------------------------------------------------
  // Chat send + moderation
  // -------------------------------------------------------------------------
  const sendChatMessage = async () => {
    if (!currentStream || !userId || !chatInput.trim()) return;
    const text = sanitizeMessage(chatInput);
    if (!text) return;
    const check = checkMessage(text, bannedWordsRef.current, myRecentRef.current, Date.now(), lastSentAtRef.current);
    if (!check.ok) {
      if (check.reason === "empty" || check.reason === "too-fast") return;
      if (check.reason === "banned-word") flash("That message couldn't be sent.");
      else if (check.reason === "repeat") flash("You just said that. Try something new.");
      else flash("That message is too long.");
      setChatInput(text);
      return;
    }
    if (blockedUsersRef.current.has(userId)) return;

    lastSentAtRef.current = Date.now();
    const msg: LiveChatMessage = {
      id: crypto.randomUUID(),
      stream_id: currentStream.id,
      user_id: userId,
      message: text,
      created_at: new Date().toISOString(),
      display_name: userProfile?.display_name || presenceName() || "Anonymous",
      avatar_url: userProfile?.avatar_url || null,
      reply_to_id: replyTarget?.id || null,
      reply_to_user_id: replyTarget?.user_id || null,
      reply_to_text: replyTarget?.message || null,
    };
    setChatInput("");
    setReplyTarget(null);

    const client = supabase();
    const { error } = await client.from("live_chat_messages").insert({
      stream_id: currentStream.id,
      user_id: userId,
      message: text,
      reply_to_id: msg.reply_to_id,
      reply_to_user_id: msg.reply_to_user_id,
      reply_to_text: msg.reply_to_text,
    });
    if (error) {
      flash("Your message couldn't be sent right now.");
      setChatInput(text);
      return;
    }

    myRecentRef.current = [...myRecentRef.current.slice(-6), text];
    chatChannelRef.current?.send({ type: "broadcast", event: "chat-message", payload: msg });
    addChatMessage(msg);
  };

  const isModeratorPermitted = (): boolean =>
    !!currentStream && !!userId &&
    (currentStream.user_id === userId || isAdmin || moderators.includes(userId));

  const muteUser = async (targetId: string, name: string) => {
    if (!currentStream || !userId) return;
    if (isModeratorPermitted()) {
      const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await supabase().from("live_mutes").insert({ stream_id: currentStream.id, user_id: targetId, muted_by: userId, expires_at: expires });
    }
    mutedUsersRef.current.set(targetId, Date.now() + 15 * 60 * 1000);
    setChatLog((prev) => prev.filter((r) => r.kind !== "msg" || r.msg.user_id !== targetId));
    chatChannelRef.current?.send({ type: "broadcast", event: "moderation", payload: { type: "mute", userId: targetId } });
    flash(`Muted ${name} for 15 min`);
  };

  const blockUser = async (targetId: string, name: string) => {
    if (!currentStream || !userId) return;
    if (isModeratorPermitted()) {
      await supabase().from("live_blocks").upsert(
        { stream_id: currentStream.id, user_id: targetId, blocked_by: userId },
        { onConflict: "stream_id,user_id" }
      );
    }
    blockedUsersRef.current.add(targetId);
    hiddenUsersRef.current.add(targetId);
    setChatLog((prev) => prev.filter((r) => r.kind !== "msg" || r.msg.user_id !== targetId));
    chatChannelRef.current?.send({ type: "broadcast", event: "moderation", payload: { type: "block", userId: targetId } });
    flash(`Blocked ${name}`);
  };

  const handleMessageAction = async (type: ActionSheetAction, msg: LiveChatMessage) => {
    if (!currentStream || !userId) return;
    if (type.type === "reply") {
      setReplyTarget(msg);
      return;
    }
    if (type.type === "pin") {
      await supabase().from("live_streams").update({ pinned_message_id: msg.id }).eq("id", currentStream.id);
      setPinnedMessage(msg);
      chatChannelRef.current?.send({ type: "broadcast", event: "pin", payload: { msg } });
      return;
    }
    if (type.type === "unpin") {
      await supabase().from("live_streams").update({ pinned_message_id: null }).eq("id", currentStream.id);
      setPinnedMessage(null);
      chatChannelRef.current?.send({ type: "broadcast", event: "unpin", payload: {} });
      return;
    }
    if (type.type === "remove") {
      await supabase().from("live_chat_messages").delete().eq("id", msg.id);
      removeMessageLocal(msg.id);
      chatChannelRef.current?.send({ type: "broadcast", event: "message-removed", payload: { id: msg.id } });
      return;
    }
    if (type.type === "mute") {
      await muteUser(msg.user_id, msg.display_name || "Anonymous");
      return;
    }
    if (type.type === "block") {
      await blockUser(msg.user_id, msg.display_name || "Anonymous");
      return;
    }
    if (type.type === "report") {
      setReportTarget({ kind: "comment", msg });
    }
  };

  const toggleSlowMode = async () => {
    if (!currentStream || !userId) return;
    const next = !slowMode;
    setSlowMode(next);
    await supabase().from("live_streams").update({ slow_mode: next, slow_mode_delay: 5 }).eq("id", currentStream.id);
    flash(next ? "Slow mode is on — one comment every 5 seconds" : "Slow mode is off");
  };

  const promoteModerator = async (targetId: string, name: string) => {
    if (!currentStream || !userId) return;
    await supabase().from("live_moderators").upsert(
      { stream_id: currentStream.id, user_id: targetId, added_by: userId },
      { onConflict: "stream_id,user_id" }
    );
    setModerators((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
    chatChannelRef.current?.send({ type: "broadcast", event: "moderation", payload: { type: "mod", userId: targetId } });
    flash(`${name} is now a moderator`);
  };

  const submitReport = async () => {
    if (!currentStream || !userId || !reportTarget) return;
    const base = {
      stream_id: currentStream.id,
      reporter_id: userId,
      reason: reportReason,
    };
    if (reportTarget.kind === "comment" && reportTarget.msg) {
      await supabase().from("live_reports").insert({
        ...base,
        target_type: "comment",
        comment_id: reportTarget.msg.id,
        reported_user_id: reportTarget.msg.user_id,
        comment_text: reportTarget.msg.message,
        details: "comment",
      });
    } else {
      await supabase().from("live_reports").insert({
        ...base,
        target_type: "stream",
        reported_user_id: currentStream.user_id,
        details: "stream",
      });
    }
    setReportTarget(null);
    flash(reportTarget.kind === "comment" ? "Comment reported. Thank you." : "Stream reported. Thank you.");
  };

  const shareStream = async () => {
    if (!currentStream) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${currentStream.title} — Live on Elovayne`, url });
      } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        flash("Link copied");
      } catch { /* no clipboard */ }
    }
  };

  // -------------------------------------------------------------------------
  // Derived render data
  // -------------------------------------------------------------------------
  const isCreator = !!currentStream && currentStream.user_id === userId;
  const isStreaming = view === "broadcasting" || view === "watching";
  const canModerate = isModeratorPermitted();

  const chatRows: ChatRow[] = [...chatLog]
    .sort((a, b) => a.ts - b.ts)
    .slice(-40)
    .map((row) =>
      row.kind === "notice"
        ? { kind: "notice" as const, id: row.id, text: row.text }
        : { kind: "msg" as const, msg: row.msg }
    );

  const statusLabel: Record<LiveConnection, string> = {
    connecting: "Connecting…",
    live: "Live",
    reconnecting: "Reconnecting…",
    weak: "Connection is weak — reconnecting…",
    disconnected: "Broadcaster disconnected",
    ended: "Stream ended",
    off: "",
  };

  const statusText = connectionStatus ? statusLabel[connectionStatus] : "";

  const watchingIndex = liveStreams.findIndex((s) => s.id === currentStream?.id);

  const recentChatterIds = Array.from(
    new Set(chatLog.filter((r) => r.kind === "msg").map((r) => (r.kind === "msg" ? r.msg.user_id : "")))
  )
    .filter((id) => id && id !== userId && !moderators.includes(id))
    .slice(0, 6);

  return (
    <main className="supports-[height:100dvh]:min-h-dvh" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0a0a, #2a0a1a, #1a0a2a, #0a1a2a)",
      backgroundSize: "400% 400%",
      animation: "liveBgShift 15s ease infinite",
      position: "relative",
      overflow: "hidden",
    }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full" style={{ top: "-15%", left: "-10%", background: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)", filter: "blur(80px)", animation: "lobbyFloat1 20s ease-in-out infinite" }} />
        <div className="absolute w-[500px] h-[500px] rounded-full" style={{ bottom: "-10%", right: "-10%", background: "radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%)", filter: "blur(70px)", animation: "lobbyFloat2 25s ease-in-out infinite" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full" style={{ top: "40%", left: "60%", background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)", filter: "blur(60px)", animation: "lobbyFloat3 18s ease-in-out infinite" }} />
        <div className="absolute w-[350px] h-[350px] rounded-full" style={{ top: "20%", right: "15%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)", filter: "blur(55px)", animation: "lobbyFloat4 22s ease-in-out infinite" }} />

        {/* Twinkling starfield */}
        <div style={{ position: "absolute", inset: 0 }}>
          {[...Array(36)].map((_, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${(i * 37 + 13) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                width: i % 5 === 0 ? 3 : 2,
                height: i % 5 === 0 ? 3 : 2,
                borderRadius: "50%",
                background: i % 3 === 0 ? "#ffd9a0" : "#ffffff",
                boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
                opacity: 0.5,
                animation: `liveTwinkle ${3 + (i % 5)}s ease-in-out ${(i % 7) * 0.4}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Aurora sweep */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: 0,
            right: 0,
            height: "70%",
            background: "linear-gradient(180deg, rgba(239, 68, 68, 0.12), rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.1), transparent)",
            filter: "blur(50px)",
            animation: "liveAuroraSweep 14s ease-in-out infinite",
          }}
        />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "calc(80px + env(safe-area-inset-top)) 20px calc(60px + env(safe-area-inset-bottom))", position: "relative", zIndex: 1 }}>

        {/* HOME */}
        {view === "home" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{
              fontSize: 36, fontWeight: 100, letterSpacing: "16px", textTransform: "uppercase",
              background: "linear-gradient(135deg, #ef4444, #f97316, #a855f7, #3b82f6, #ef4444)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              margin: "0 0 12px", textAlign: "center",
              animation: "liveShimmer 8s ease-in-out infinite",
              filter: "drop-shadow(0 0 18px rgba(249, 115, 22, 0.25))",
            }}>
              LIVE
            </h1>
            <p style={{ fontSize: 13, color: "rgba(224, 245, 232, 0.35)", textAlign: "center", margin: "0 0 48px", lineHeight: 1.6 }}>
              Real people. Right now.
            </p>

            {userId && (
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <button onClick={() => setView("start")} style={{
                  padding: "14px 32px", borderRadius: 12,
                  background: "linear-gradient(135deg, #ef4444, #f97316, #a855f7)",
                  backgroundSize: "200% 200%",
                  border: "none", color: "white", fontSize: 14, fontWeight: 500,
                  cursor: "pointer", boxShadow: "0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(168, 85, 247, 0.2)",
                  letterSpacing: "1px", textTransform: "uppercase",
                  animation: "liveShimmer 6s ease-in-out infinite",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                >
                  Start Live
                </button>
              </div>
            )}

            {loading ? (
              <p style={{ textAlign: "center", color: "rgba(224, 245, 232, 0.3)", fontSize: 13 }}>Finding live streams...</p>
            ) : liveStreams.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3, animation: "liveHaloPulse 3s ease-in-out infinite" }}>📡</div>
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
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)", animation: "pulse 2s ease-in-out infinite" }} />
                      <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>LIVE</span>
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

        {/* START */}
        {view === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => { setView("home"); setPreviewActive(false); }} style={{
              fontSize: 10, color: "rgba(0, 255, 136, 0.5)", background: "none", border: "none",
              cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
            }}>← Back</button>

            <h2 style={{ fontSize: 18, fontWeight: 300, color: "#e0f5e8", marginBottom: 24, textAlign: "center", letterSpacing: "4px", textTransform: "uppercase" }}>
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
                  fontSize: 16, outline: "none", marginBottom: 24, boxSizing: "border-box",
                }}
              />

              {previewActive ? (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "var(--bg-color)", aspectRatio: "9 / 16", maxHeight: 360, boxShadow: "var(--shadow-xl)" }}>
                    <video ref={localVideoRef} autoPlay playsInline muted style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                      transform: cameraFacing === "user" ? "scaleX(-1)" : "none",
                    }} />
                    <div style={{ position: "absolute", top: 12, left: 12, padding: "6px 12px", borderRadius: 9999, background: "rgba(16, 155, 136, 0.85)", color: "white", fontSize: 9, fontWeight: 600, letterSpacing: "1px" }}>
                      PREVIEW
                    </div>
                    <div style={{ position: "absolute", bottom: 12, left: 12, padding: "4px 8px", borderRadius: 6, background: "rgba(0,0,0,0.6)", color: "#a0d2bd", fontSize: 8, fontWeight: 500 }}>
                      {`${this.width}p · ${this.fps}fps`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={flipCamera} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "rgba(16, 155, 136, 0.06)", border: "1px solid rgba(16, 155, 136, 0.18)", color: "#10b988", fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", cursor: "pointer" }}>
                      🔄 Flip
                    </button>
                    <button onClick={() => { pipelineRef.current?.stop(); pipelineRef.current = null; setPreviewActive(false); }} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "rgba(16, 155, 136, 0.06)", border: "1px solid rgba(16, 155, 136, 0.18)", color: "#10b988", fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", cursor: "pointer" }}>
                      Stop preview
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={startPreview} style={{
                  width: "100%", padding: "14px", borderRadius: 10, marginBottom: 16,
                  background: "rgba(0, 255, 136, 0.06)",
                  border: "1px solid rgba(0, 255, 136, 0.2)",
                  color: "#00ff88", fontSize: 13, cursor: "pointer",
                  letterSpacing: "1px",
                }}>
                  ✨ Filters &amp; Preview
                </button>
              )}

              {previewActive && (
                <div style={{ marginBottom: 20 }}>
                  <FilterPicker currentId={filterId} onSelect={changeFilter} />
                </div>
              )}

              {error && (
                <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 16, textAlign: "center" }}>{error}</p>
              )}

              <button onClick={startBroadcast} disabled={!streamTitle.trim()} style={{
                width: "100%", padding: "14px 20px", borderRadius: 10,
                background: streamTitle.trim() ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(16, 155, 136, 0.12)",
                border: streamTitle.trim() ? "none" : "1px solid rgba(16, 155, 136, 0.2)",
                color: streamTitle.trim() ? "white" : "rgba(16, 155, 136, 0.8)",
                fontSize: 13, fontWeight: 500, cursor: streamTitle.trim() ? "pointer" : "default",
                letterSpacing: "1px", textTransform: "uppercase",
                transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
              }}>
                Go Live{filterId !== "natural" ? ` · ${getFilter(filterId).label}` : ""}
              </button>
            </div>
          </motion.div>
        )}

        {/* BROADCASTING */}
        {view === "broadcasting" && currentStream && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "fixed", inset: 0, zIndex: 50 }}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover",
                transform: cameraFacing === "user" ? "scaleX(-1)" : "none",
                visibility: cameraOff ? "hidden" : "visible",
              }}
            />

            {cameraOff && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Camera is off</p>
              </div>
            )}

            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />

            {/* Floating reactions */}
            <div style={{ position: "absolute", right: 12, bottom: "42%", zIndex: 6, pointerEvents: "none" }}>
              <AnimatePresence>
                {reactions.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -130, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.6, ease: "easeOut" }}
                    style={{ position: "absolute", bottom: 0, left: `${r.x}%`, fontSize: 22, transform: "translateX(-50%)" }}
                  >
                    {r.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Top bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              padding: "calc(16px + env(safe-area-inset-top)) 16px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, background: "rgba(239, 68, 68, 0.85)", fontSize: 10, fontWeight: 700, color: "white", letterSpacing: "2px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.8)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  ON AIR
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                  {viewerCount} watching
                </span>
                <span style={{ fontSize: 11, color: "#4ade80" }}>● Live</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setMoreSheetOpen(true)} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: 14, cursor: "pointer" }}>
                  ⋯
                </button>
                <button onClick={stopBroadcast} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(239, 68, 68, 0.9)", border: "none", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  End Live
                </button>
              </div>
            </div>

            {/* Chat overlay */}
            {!chatHidden && (
              <LiveChatOverlay
                rows={chatRows}
                pinnedMessage={pinnedMessage}
                currentUserId={userId}
                canModerate={canModerate}
                onAction={handleMessageAction}
              />
            )}

            {/* Bottom controls */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: `12px 16px calc(16px + ${keyboardOffset}px + env(safe-area-inset-bottom))`,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <AnimatePresence>
                {filterPanelOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} style={{ padding: "12px 4px", borderRadius: 14, background: "rgba(13, 27, 20, 0.85)", border: "1px solid rgba(0,255,136,0.12)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
                    <FilterPicker currentId={filterId} onSelect={changeFilter} />
                  </motion.div>
                )}
              </AnimatePresence>

              {chatError && (
                <div style={{ fontSize: 11, color: "rgba(255, 196, 0, 0.9)", textAlign: "center" }}>{chatError}</div>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
                <button onClick={toggleMic} style={{ width: 48, height: 48, borderRadius: "50%", background: micMuted ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: 18, cursor: "pointer", backdropFilter: "blur(8px)" }} title={micMuted ? "Unmute" : "Mute"}>
                  {micMuted ? "🔇" : "🎤"}
                </button>
                <button onClick={toggleCamera} style={{ width: 48, height: 48, borderRadius: "50%", background: cameraOff ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: 18, cursor: "pointer", backdropFilter: "blur(8px)" }} title={cameraOff ? "Camera on" : "Camera off"}>
                  {cameraOff ? "📷" : "📹"}
                </button>
                <button onClick={flipCamera} style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: 18, cursor: "pointer", backdropFilter: "blur(8px)" }} title="Flip camera">
                  🔄
                </button>
                <button onClick={() => setFilterPanelOpen(o => !o)} style={{ width: 48, height: 48, borderRadius: "50%", background: filterPanelOpen || filterId !== "natural" ? "rgba(0,255,136,0.35)" : "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: 18, cursor: "pointer", backdropFilter: "blur(8px)" }} title="Filters">
                  ✨
                </button>
                <button onClick={() => setChatHidden(h => !h)} style={{ width: 48, height: 48, borderRadius: "50%", background: chatHidden ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: 18, cursor: "pointer", backdropFilter: "blur(8px)" }} title={chatHidden ? "Show chat" : "Hide chat"}>
                  {chatHidden ? "💬" : "💬"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* WATCHING */}
        {view === "watching" && currentStream && (
          <motion.div
            drag={!keyboardOffset ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.y < -90) switchStream(1);
              else if (info.offset.y > 90) switchStream(-1);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, touchAction: "pan-y" }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: "#000" }}
            />

            {(connectionStatus === "connecting" || connectionStatus === "reconnecting" || connectionStatus === "weak") && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", zIndex: 2 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 34, height: 34, margin: "0 auto 12px", border: "2px solid rgba(0,255,136,0.2)", borderTopColor: "#00ff88", borderRadius: "50%", animation: "liveSpin 1s linear infinite" }} />
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
                    {statusText}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Swipe up or down to change live</p>
                </div>
              </div>
            )}

            {connectionStatus === "ended" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", zIndex: 3 }}>
                <div style={{ textAlign: "center", padding: "0 24px" }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>🔌</div>
                  <p style={{ fontSize: 16, color: "white", marginBottom: 6 }}>Stream ended</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
                    {currentStream.broadcaster_name} is no longer live.
                  </p>
                  {liveStreams.length > 0 ? (
                    <button onClick={() => switchStream(watchingIndex >= liveStreams.length - 1 ? -1 : 1)} style={{ padding: "12px 24px", borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Watch another live
                    </button>
                  ) : (
                    <button onClick={leaveStream} style={{ padding: "12px 24px", borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: 13, cursor: "pointer" }}>
                      Back to Live
                    </button>
                  )}
                </div>
              </div>
            )}

            {connectionStatus === "disconnected" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", zIndex: 3 }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Broadcaster disconnected</p>
              </div>
            )}

            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />

            {/* Top bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              padding: "calc(16px + env(safe-area-inset-top)) 16px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(239, 68, 68, 0.85)", fontSize: 10, fontWeight: 700, color: "white", letterSpacing: "2px" }}>LIVE</div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{viewerCount} watching</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setMoreSheetOpen(true)} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: 14, cursor: "pointer" }}>⋯</button>
                <button onClick={leaveStream} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: 12, cursor: "pointer" }}>Leave</button>
              </div>
            </div>

            {/* Stream info */}
            <div style={{ position: "absolute", top: "calc(64px + env(safe-area-inset-top))", left: 16, zIndex: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 4, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                {currentStream.title}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                {currentStream.broadcaster_name}
              </div>
              {currentStream.filter && currentStream.filter !== "natural" && (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                  ✨ {getFilter(currentStream.filter).label}
                </div>
              )}
            </div>

            {/* Chat overlay */}
            {!chatHidden && (
              <LiveChatOverlay
                rows={chatRows}
                pinnedMessage={pinnedMessage}
                currentUserId={userId}
                canModerate={canModerate}
                onAction={handleMessageAction}
              />
            )}

            {/* Floating reactions */}
            <div style={{ position: "absolute", right: 12, bottom: "42%", zIndex: 6, pointerEvents: "none" }}>
              <AnimatePresence>
                {reactions.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -130, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.6, ease: "easeOut" }}
                    style={{ position: "absolute", bottom: 0, left: `${r.x}%`, fontSize: 22, transform: "translateX(-50%)" }}
                  >
                    {r.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom - viewer controls */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: `12px 16px calc(16px + ${keyboardOffset}px + env(safe-area-inset-bottom))`,
              display: "flex", flexDirection: "column", gap: 10, zIndex: 5,
            }}>
              {chatError && (
                <div style={{ fontSize: 11, color: "rgba(255, 196, 0, 0.9)", textAlign: "center" }}>{chatError}</div>
              )}

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {replyTarget && (
                  <button onClick={() => setReplyTarget(null)} style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", color: "#00ff88", fontSize: 10, padding: "6px 10px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                    ↳ @{replyTarget.display_name}
                  </button>
                )}
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                  placeholder="Say something..."
                  style={{
                    flex: 1, minWidth: 0, background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    borderRadius: 22, padding: "11px 16px", color: "white",
                    fontSize: 15, outline: "none",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <button onClick={sendChatMessage} style={{ padding: "11px 18px", borderRadius: 22, background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Send
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {REACTION_EMOJIS.map(emoji => (
                  <button key={emoji} onClick={() => sendReaction(emoji)} style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)", border: "none", fontSize: 18,
                    cursor: "pointer", backdropFilter: "blur(8px)",
                  }} title={`React ${emoji}`}>{emoji}</button>
                ))}
                <div style={{ flex: 1 }} />
                <button onClick={shareStream} style={{ padding: "9px 14px", borderRadius: 22, background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: 12, cursor: "pointer" }}>
                  ↪ Share
                </button>
                <button onClick={() => setChatHidden(h => !h)} style={{ padding: "9px 14px", borderRadius: 22, background: chatHidden ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: 12, cursor: "pointer" }}>
                  {chatHidden ? "Show chat" : "Hide chat"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Report sheet */}
        <AnimatePresence>
          {reportTarget && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 95 }} onClick={() => setReportTarget(null)} />
              <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 96, background: "rgba(18, 34, 25, 0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(0, 255, 136, 0.15)", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "20px 20px calc(20px + env(safe-area-inset-bottom))" }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: "#e0f5e8", marginBottom: 4 }}>
                  Report {reportTarget.kind === "comment" ? "comment" : "live"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(224,245,232,0.5)", marginBottom: 16 }}>
                  Our moderators will review this. Reports are private.
                </div>
                {REPORT_REASONS.map(r => (
                  <button key={r} onClick={() => setReportReason(r)} style={{
                    display: "block", width: "100%", textAlign: "left", padding: "13px 16px", borderRadius: 12, marginBottom: 6, cursor: "pointer",
                    background: reportReason === r ? "rgba(0,255,136,0.12)" : "rgba(0,255,136,0.04)",
                    border: reportReason === r ? "1px solid rgba(0,255,136,0.4)" : "1px solid rgba(0,255,136,0.1)",
                    color: reportReason === r ? "#00ff88" : "#e0f5e8", fontSize: 13,
                  }}>
                    {r}
                  </button>
                ))}
                <button onClick={submitReport} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(239,68,68,0.8)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 6 }}>
                  Submit Report
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* More sheet (creator) */}
        <AnimatePresence>
          {moreSheetOpen && isStreaming && isCreator && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 95 }} onClick={() => setMoreSheetOpen(false)} />
              <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 96, background: "rgba(18, 34, 25, 0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(0, 255, 136, 0.15)", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "20px 20px calc(20px + env(safe-area-inset-bottom))", maxHeight: "60vh", overflowY: "auto" }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: "#e0f5e8", marginBottom: 14 }}>Live Settings</div>

                <button onClick={toggleSlowMode} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "13px 16px", borderRadius: 12, background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.12)", color: "#e0f5e8", fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
                  <span>Slow mode (5s between comments)</span>
                  <span style={{ color: slowMode ? "#00ff88" : "rgba(224,245,232,0.4)" }}>{slowMode ? "ON" : "OFF"}</span>
                </button>

                <div style={{ fontSize: 11, color: "rgba(224,245,232,0.5)", margin: "12px 0 8px" }}>
                  Promote a viewer to moderator
                </div>
                {recentChatterIds.length === 0 ? (
                  <div style={{ fontSize: 12, color: "rgba(224,245,232,0.4)", padding: "8px 4px" }}>No recent chatters yet.</div>
                ) : (
                  recentChatterIds.map(chatterId => {
                    const row = chatLog.find(r => r.kind === "msg" && r.msg.user_id === chatterId);
                    const name = row && row.kind === "msg" ? row.msg.display_name : "Anonymous";
                    return (
                      <>
                        {/* eslint-disable-next-line react-hooks/refs -- promoteModerator reads chatChannelRef but only runs on click */}
                        <button key={chatterId} onClick={() => { promoteModerator(chatterId, name || "Anonymous"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.1)", color: "#e0f5e8", fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
                          <span>{name}</span>
                          <span style={{ fontSize: 11, color: "#00ff88" }}>Promote</span>
                        </button>
                      </>
                    );
                  })
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* More sheet (viewer) */}
        <AnimatePresence>
          {moreSheetOpen && isStreaming && !isCreator && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 95 }} onClick={() => setMoreSheetOpen(false)} />
              <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 96, background: "rgba(18, 34, 25, 0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(0, 255, 136, 0.15)", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "20px 20px calc(20px + env(safe-area-inset-bottom))" }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: "#e0f5e8", marginBottom: 14 }}>More</div>
                <button onClick={shareStream} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", borderRadius: 12, background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.12)", color: "#e0f5e8", fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
                  ↪ Share live
                </button>
                <button onClick={() => { setMoreSheetOpen(false); setReportTarget({ kind: "stream" }); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
                  ⚑ Report live
                </button>
                <button onClick={() => { hiddenUsersRef.current.add(currentStream!.user_id); setChatHidden(true); leaveStream(); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
                  🚫 Block this creator
                </button>
                <button onClick={() => { setChatHidden(h => !h); setMoreSheetOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", borderRadius: 12, background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.12)", color: "#e0f5e8", fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
                  {chatHidden ? "👁 Show chat" : "🙈 Hide chat"}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}