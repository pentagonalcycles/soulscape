"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Link from "next/link";

interface Block {
  x: number;
  y: number;
  z: number;
  type: string;
  color: string;
}

interface BlockType {
  id: string;
  name: string;
  color: string;
  emoji: string;
  category: string;
}

const BLOCK_TYPES: BlockType[] = [
  { id: "wall-dark", name: "Dark Wall", color: "#1a1040", emoji: "🧱", category: "Walls" },
  { id: "wall-purple", name: "Purple Wall", color: "#3a1a5a", emoji: "🟪", category: "Walls" },
  { id: "wall-blue", name: "Blue Wall", color: "#1a2a5a", emoji: "🟦", category: "Walls" },
  { id: "wall-gold", name: "Gold Wall", color: "#4a3a10", emoji: "🟨", category: "Walls" },
  { id: "floor-wood", name: "Wood", color: "#5a3a20", emoji: "🟫", category: "Floor" },
  { id: "floor-marble", name: "Marble", color: "#c0b8d0", emoji: "⬜", category: "Floor" },
  { id: "floor-dark", name: "Dark Floor", color: "#1a1020", emoji: "⬛", category: "Floor" },
  { id: "bed", name: "Bed", color: "#7a3070", emoji: "🛏️", category: "Furniture" },
  { id: "table", name: "Table", color: "#6a4a30", emoji: "🪑", category: "Furniture" },
  { id: "shelf", name: "Bookshelf", color: "#5a3a20", emoji: "📚", category: "Furniture" },
  { id: "lamp", name: "Lamp", color: "#f0d060", emoji: "💡", category: "Decor" },
  { id: "plant", name: "Plant", color: "#2a7a30", emoji: "🌿", category: "Decor" },
  { id: "crystal", name: "Crystal", color: "#a080f0", emoji: "💎", category: "Decor" },
  { id: "candle", name: "Candle", color: "#f0a040", emoji: "🕯️", category: "Decor" },
  { id: "star", name: "Star Block", color: "#f0e060", emoji: "⭐", category: "Magic" },
  { id: "moon", name: "Moon", color: "#e0d080", emoji: "🌙", category: "Magic" },
  { id: "portal", name: "Portal", color: "#7040e0", emoji: "🌀", category: "Magic" },
];

const GRID_SIZE = 10;

export default function RoomBuilder3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>(BLOCK_TYPES[0]);
  const [activeTool, setActiveTool] = useState<"place" | "remove">("place");
  const [showPalette, setShowPalette] = useState(typeof window !== "undefined" ? window.innerWidth > 640 : true);
  const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number; z: number } | null>(null);
  const [cameraAngle, setCameraAngle] = useState({ theta: Math.PI / 4, phi: Math.PI / 4 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [cameraDistance, setCameraDistance] = useState(20);
  const blocksRef = useRef<Block[]>([]);
  const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const highlightRef = useRef<THREE.Mesh | null>(null);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0520);
    scene.fog = new THREE.Fog(0x0a0520, 30, 60);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x9d7cd8, 0.3);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0xf5d062, 0.5, 30);
    pointLight.position.set(5, 8, 5);
    scene.add(pointLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1030,
      roughness: 0.8,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x2a1a50, 0x1a0a30);
    gridHelper.position.y = -0.49;
    scene.add(gridHelper);

    // Highlight cube
    const highlightGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0x9d7cd8,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlight.visible = false;
    scene.add(highlight);
    highlightRef.current = highlight;

    // Initialize room
    const initialBlocks: Block[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        initialBlocks.push({ x, y: 0, z, type: "floor-wood", color: "#5a3a20" });
      }
    }
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 1; y < 4; y++) {
        initialBlocks.push({ x, y, z: 0, type: "wall-purple", color: "#3a1a5a" });
      }
    }
    for (let z = 0; z < GRID_SIZE; z++) {
      for (let y = 1; y < 4; y++) {
        initialBlocks.push({ x: 0, y, z, type: "wall-purple", color: "#3a1a5a" });
      }
    }
    setBlocks(initialBlocks);
    blocksRef.current = initialBlocks;

    // Render loop
    let animId: number;
    const render = () => {
      animId = requestAnimationFrame(render);

      // Update camera position
      const x = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
      const y = cameraDistance * Math.cos(cameraAngle.phi);
      const z = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
      camera.position.set(x + 5, y + 5, z + 5);
      camera.lookAt(5, 2, 5);

      renderer.render(scene, camera);
    };
    render();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Update 3D blocks when state changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove old meshes
    meshesRef.current.forEach((mesh) => scene.remove(mesh));
    meshesRef.current.clear();

    // Add new meshes
    blocks.forEach((block) => {
      const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
      const color = new THREE.Color(block.color);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.7,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(block.x, block.y, block.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshesRef.current.set(`${block.x}-${block.y}-${block.z}`, mesh);
    });
  }, [blocks]);

  // Mouse controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 1) {
      setIsDragging(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      setCameraAngle((prev) => ({
        theta: prev.theta + dx * 0.01,
        phi: Math.max(0.2, Math.min(Math.PI / 2 - 0.1, prev.phi - dy * 0.01)),
      }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(meshesRef.current.values())
    );

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const pos = intersect.object.position;
      const normal = intersect.face?.normal;

      if (activeTool === "remove") {
        setBlocks((prev) => prev.filter((b) => !(b.x === pos.x && b.y === pos.y && b.z === pos.z)));
      } else if (activeTool === "place" && normal) {
        const newX = Math.round(pos.x + normal.x);
        const newY = Math.round(pos.y + normal.y);
        const newZ = Math.round(pos.z + normal.z);

        if (newY >= 0 && newY < 8) {
          const exists = blocksRef.current.some((b) => b.x === newX && b.y === newY && b.z === newZ);
          if (!exists) {
            setBlocks((prev) => [
              ...prev,
              { x: newX, y: newY, z: newZ, type: selectedBlock.id, color: selectedBlock.color },
            ]);
          }
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    setCameraDistance((prev) => Math.max(10, Math.min(40, prev + e.deltaY * 0.05)));
  };

  const clearRoom = () => {
    const initial: Block[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        initial.push({ x, y: 0, z, type: "floor-wood", color: "#5a3a20" });
      }
    }
    setBlocks(initial);
  };

  const categories = [...new Set(BLOCK_TYPES.map((b) => b.category))];

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#ffffff", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, padding: "8px 12px", background: "rgba(10,5,30,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(157,124,216,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>✦</span>
          <span style={{ fontSize: "13px", fontWeight: 300, color: "#e8e0f0" }}>3D Room Builder</span>
          <span style={{ fontSize: "10px", color: "rgba(157,124,216,0.4)", marginLeft: "8px" }}>
            {blocks.length} blocks
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={clearRoom} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}>
            Clear
          </button>
          <Link href="/" style={{ fontSize: "10px", color: "rgba(157,124,216,0.6)", textDecoration: "none" }}>← Exit</Link>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left toolbar */}
        <div className="max-sm:w-[40px]" style={{
          width: "52px", background: "rgba(10,5,30,0.95)", borderRight: "1px solid rgba(157,124,216,0.15)",
          display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: "6px",
        }}>
          {[
            { id: "place", icon: "＋", label: "Place" },
            { id: "remove", icon: "✕", label: "Remove" },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as "place" | "remove")}
              title={tool.label}
              style={{
                width: "40px", height: "40px", borderRadius: "10px", border: "none",
                background: activeTool === tool.id ? "rgba(157,124,216,0.2)" : "transparent",
                color: activeTool === tool.id ? "#e8e0f0" : "rgba(157,124,216,0.5)",
                fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {tool.icon}
            </button>
          ))}

          <div style={{ width: "30px", height: "1px", background: "rgba(157,124,216,0.15)", margin: "4px 0" }} />

          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: selectedBlock.color, border: "2px solid rgba(157,124,216,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
          }}>
            {selectedBlock.emoji}
          </div>
        </div>

        {/* 3D Canvas */}
        <div
          ref={containerRef}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          style={{ flex: 1, cursor: activeTool === "remove" ? "crosshair" : "default" }}
        />

        {/* Right panel - Block palette */}
        {showPalette && (
          <div className="max-sm:w-[120px]" style={{
            width: "160px", background: "rgba(10,5,30,0.95)", borderLeft: "1px solid rgba(157,124,216,0.15)",
            display: "flex", flexDirection: "column", overflowY: "auto",
          }}>
            <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(157,124,216,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#e8e0f0" }}>Blocks</span>
              <button onClick={() => setShowPalette(false)} style={{ background: "none", border: "none", color: "rgba(157,124,216,0.5)", cursor: "pointer", fontSize: "10px" }}>✕</button>
            </div>

            {categories.map((cat) => (
              <div key={cat}>
                <div style={{ padding: "5px 10px", fontSize: "8px", fontWeight: 600, color: "rgba(157,124,216,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {cat}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px", padding: "0 6px 6px" }}>
                  {BLOCK_TYPES.filter((b) => b.category === cat).map((block) => (
                    <button
                      key={block.id}
                      onClick={() => setSelectedBlock(block)}
                      title={block.name}
                      style={{
                        padding: "6px 2px", borderRadius: "6px", textAlign: "center", cursor: "pointer",
                        background: selectedBlock.id === block.id ? "rgba(157,124,216,0.2)" : "rgba(157,124,216,0.05)",
                        border: `1px solid ${selectedBlock.id === block.id ? "rgba(157,124,216,0.4)" : "rgba(157,124,216,0.1)"}`,
                      }}
                    >
                      <div style={{ fontSize: "16px" }}>{block.emoji}</div>
                      <div style={{ fontSize: "7px", color: "rgba(157,124,216,0.5)", marginTop: "2px" }}>{block.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toggle palette */}
        {!showPalette && (
          <button
            onClick={() => setShowPalette(true)}
            style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              width: "24px", height: "60px", borderRadius: "8px 0 0 8px",
              background: "rgba(10,5,30,0.9)", border: "1px solid rgba(157,124,216,0.2)", borderRight: "none",
              color: "rgba(157,124,216,0.6)", fontSize: "12px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ◀
          </button>
        )}
      </div>

      {/* Bottom status */}
      <div className="max-sm:text-[8px] max-sm:gap-2" style={{
        flexShrink: 0, padding: "4px 12px", background: "rgba(10,5,30,0.95)",
        borderTop: "1px solid rgba(157,124,216,0.15)", display: "flex", justifyContent: "space-between",
        fontSize: "10px", color: "rgba(157,124,216,0.4)",
      }}>
        <span>Right-click drag to rotate • Scroll to zoom</span>
        <span>Tool: {activeTool === "place" ? "＋ Place" : "✕ Remove"}</span>
        <span>{blocks.length} blocks</span>
      </div>
    </div>
  );
}
