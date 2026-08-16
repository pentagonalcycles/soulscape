"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { MuralRoom, MuralStroke, BrushType, StrokeSegment, CursorUpdate, CURSOR_COLORS, Point } from "@/lib/mural/types";
import { drawBrushStroke, BrushParams } from "@/lib/mural/brushes";
import { MuralMultiplayer, ChatMessage } from "@/lib/mural/multiplayer";
import MuralToolbar from "./MuralToolbar";
import MuralChat from "./MuralChat";

interface MuralCanvasProps {
  room: MuralRoom;
  onLeave: () => void;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export default function MuralCanvas({ room, onLeave }: MuralCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const multiRef = useRef<MuralMultiplayer | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<Point | null>(null);
  const currentStrokePoints = useRef<Point[]>([]);
  const localHistory = useRef<ImageData[]>([]);
  const historyIndex = useRef(-1);

  const [brushType, setBrushType] = useState<BrushType>("pen");
  const [brushSize, setBrushSize] = useState(4);
  const [brushHardness, setBrushHardness] = useState(100);
  const [opacity, setOpacity] = useState(1);
  const [color, setColor] = useState("#0f172a");
  const [cursors, setCursors] = useState<Map<string, CursorUpdate>>(new Map());
  const [presences, setPresences] = useState<Map<string, { color: string; name: string }>>(new Map());
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const userColor = CURSOR_COLORS[Math.abs(hashCode(userId || "anon")) % CURSOR_COLORS.length];
  const userName = "Painter";

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    localHistory.current = localHistory.current.slice(0, historyIndex.current + 1);
    localHistory.current.push(data);
    if (localHistory.current.length > 30) localHistory.current.shift();
    historyIndex.current = localHistory.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndex.current <= 0) return;
    historyIndex.current--;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(localHistory.current[historyIndex.current], 0, 0);
  }, []);

  const getCanvasPos = useCallback((e: { clientX: number; clientY: number }): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const renderRemoteSegment = useCallback((seg: StrokeSegment) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const params: BrushParams = {
      color: seg.color,
      brushSize: seg.brushSize,
      opacity: seg.opacity,
      brushType: seg.brushType,
      brushHardness: seg.brushHardness,
    };
    drawBrushStroke(ctx, seg.to.x, seg.to.y, seg.from.x, seg.from.y, params);
  }, []);

  const renderCursors = useCallback((cursorMap: Map<string, CursorUpdate>) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    cursorMap.forEach((cursor) => {
      const sx = (cursor.x / room.canvas_width) * overlay.width;
      const sy = (cursor.y / room.canvas_height) * overlay.height;

      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = cursor.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 1;
      ctx.stroke();

      ctx.font = "10px Inter, sans-serif";
      const textWidth = ctx.measureText(cursor.name).width;
      const tx = sx - textWidth / 2;
      const ty = sy + 18;

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.roundRect(tx - 4, ty - 10, textWidth + 8, 14, 3);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(cursor.name, tx, ty);
    });
  }, [room.canvas_width, room.canvas_height]);

  useEffect(() => {
    const uid = `mural-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setUserId(uid);

    const canvas = canvasRef.current;
    if (!canvas) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        canvas.width = room.canvas_width;
        canvas.height = room.canvas_height;

        const overlay = overlayRef.current;
        if (overlay) {
          overlay.width = room.canvas_width;
          overlay.height = room.canvas_height;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) { setLoading(false); return; }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const multi = new MuralMultiplayer();
        multiRef.current = multi;

        multi.onCursorMove = (_uid, data) => {
          setCursors((prev) => { const next = new Map(prev); next.set(_uid, data); return next; });
        };
        multi.onStrokeSegment = (_uid, seg) => { renderRemoteSegment(seg); };
        multi.onUserJoin = (_uid, data) => {
          setPresences((prev) => { const next = new Map(prev); next.set(_uid, data); return next; });
        };
        multi.onUserLeave = (_uid) => {
          setCursors((prev) => { const next = new Map(prev); next.delete(_uid); return next; });
          setPresences((prev) => { const next = new Map(prev); next.delete(_uid); return next; });
        };
        multi.onChatMessage = (msg) => { setChatMessages((prev) => [...prev.slice(-99), msg]); };

        const { data } = await supabase()
          .from("mural_strokes")
          .select("*")
          .eq("room_id", room.id)
          .order("created_at", { ascending: true });

        if (data) {
          for (const stroke of data as MuralStroke[]) {
            const sd = stroke.stroke_data;
            if (!sd.points || sd.points.length < 2) continue;
            const params: BrushParams = { color: sd.color, brushSize: sd.brushSize, opacity: sd.opacity, brushType: sd.brushType, brushHardness: sd.brushHardness };
            for (let i = 1; i < sd.points.length; i++) {
              drawBrushStroke(ctx, sd.points[i].x, sd.points[i].y, sd.points[i - 1].x, sd.points[i - 1].y, params);
            }
          }
        }

        saveToHistory();
        multi.join(room.id, uid, userColor, userName);
        setLoading(false);
      } catch (e) {
        console.error("[MuralCanvas] Init error:", e);
        setLoading(false);
      }
    };

    init();

    return () => { multiRef.current?.leave(); };
  }, [room.id]);

  useEffect(() => {
    renderCursors(cursors);
  }, [cursors, renderCursors]);

  function persistStroke(points: Point[]) {
    if (!userId || points.length < 2) return;
    const client = supabase();
    client.from("mural_strokes").insert({
      room_id: room.id,
      user_id: userId,
      stroke_data: {
        points,
        color,
        brushType,
        brushSize,
        opacity,
        brushHardness,
      },
    });
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    const pos = "touches" in e ? getCanvasPos(e.touches[0]) : getCanvasPos(e as React.MouseEvent);
    if (!pos) return;
    isDrawingRef.current = true;
    lastPosRef.current = pos;
    currentStrokePoints.current = [pos];
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    const rawPos = "touches" in e ? e.touches[0] : e;
    const pos = getCanvasPos(rawPos);
    if (!pos) return;

    multiRef.current?.broadcastCursor(pos.x, pos.y, userColor, userName);

    if (!isDrawingRef.current || !lastPosRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const params: BrushParams = { color, brushSize, opacity, brushType, brushHardness };
    drawBrushStroke(ctx, pos.x, pos.y, lastPosRef.current.x, lastPosRef.current.y, params);

    const seg: Omit<StrokeSegment, "userId"> = {
      from: lastPosRef.current,
      to: pos,
      color,
      brushType,
      brushSize,
      opacity,
      brushHardness,
    };
    multiRef.current?.broadcastStrokeSegment(seg);

    currentStrokePoints.current.push(pos);
    lastPosRef.current = pos;
  }

  function handleEnd() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPosRef.current = null;
    saveToHistory();
    persistStroke(currentStrokePoints.current);
    currentStrokePoints.current = [];
  }

  function handleSendChat(text: string) {
    multiRef.current?.broadcastChatMessage(text);
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: "#f0fdf9" }}>
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "#f0fdf9" }}>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: "rgba(240, 255, 245, 0.6)" }}>Loading mural...</p>
          </div>
        </div>
      )}

      <MuralToolbar
        brushType={brushType}
        brushSize={brushSize}
        brushHardness={brushHardness}
        opacity={opacity}
        color={color}
        onBrushTypeChange={setBrushType}
        onBrushSizeChange={setBrushSize}
        onBrushHardnessChange={setBrushHardness}
        onOpacityChange={setOpacity}
        onColorChange={setColor}
        onUndo={undo}
        onLeave={onLeave}
        roomName={room.name}
        presences={Array.from(presences.entries()).map(([uid, p]) => ({ userId: uid, ...p }))}
        isOpen={toolbarOpen}
        onToggle={() => setToolbarOpen(!toolbarOpen)}
      />

      <div
        className="absolute inset-0 flex items-center justify-center p-2 sm:p-4"
        style={{
          left: toolbarOpen ? "min(300px, 85vw)" : "0",
          transition: "left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <div className="relative inline-block w-full h-full flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            style={{
              cursor: "crosshair",
              boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
              borderRadius: "4px",
              maxWidth: "100%",
              maxHeight: "calc(100vh - 32px)",
              display: "block",
              touchAction: "none",
            }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
          <canvas
            ref={overlayRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              maxWidth: "100%",
              maxHeight: "calc(100vh - 32px)",
            }}
          />
        </div>
      </div>

      <MuralChat
        messages={chatMessages}
        onSend={handleSendChat}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}
