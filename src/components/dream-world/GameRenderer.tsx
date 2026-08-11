"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { buildChunkMesh } from "@/lib/dream-world/mesh-builder";
import { getBlockDef } from "@/lib/dream-world/blocks";
import type { ChunkData, DayNightState } from "@/lib/dream-world/types";

interface GameRendererProps {
  chunks: Map<string, ChunkData>;
  dayNight: DayNightState;
  playerPosition: { x: number; y: number; z: number };
  playerRotation: { x: number; y: number; z: number };
  weatherType?: string;
  weatherIntensity?: number;
  blockEvents?: Array<{ x: number; y: number; z: number; type: "break" | "place"; color: string }>;
  worldConfig?: { skyTopColor: string; skyHorizonColor: string; fogColor: string; accentColor: string } | null;
  droppedItems?: Array<{ id: string; blockId: number; x: number; y: number; z: number; age: number }>;
  breakProgress?: number;
  breakTarget?: { x: number; y: number; z: number };
}

// Animal types with enhanced shapes
const ANIMAL_TYPES = [
  { type: "dream_fox", color: 0xa78bfa, size: 0.5, speed: 0.02, bodyParts: "quadruped" },
  { type: "star_bunny", color: 0xf5d062, size: 0.3, speed: 0.03, bodyParts: "quadruped" },
  { type: "crystal_deer", color: 0x2dd4a8, size: 0.8, speed: 0.015, bodyParts: "quadruped" },
  { type: "glow_butterfly", color: 0xe879a8, size: 0.2, speed: 0.04, bodyParts: "flying" },
  { type: "void_cat", color: 0x6366f1, size: 0.4, speed: 0.025, bodyParts: "quadruped" },
  { type: "nebula_bird", color: 0xf093b8, size: 0.25, speed: 0.05, bodyParts: "flying" },
  { type: "moon_wolf", color: 0x9b8cc0, size: 0.6, speed: 0.02, bodyParts: "quadruped" },
  { type: "star_dust_moth", color: 0xc8b8e8, size: 0.15, speed: 0.06, bodyParts: "flying" },
  { type: "aurora_bear", color: 0x2dd4a8, size: 0.9, speed: 0.01, bodyParts: "quadruped" },
  { type: "cosmic_rabbit", color: 0xf472b6, size: 0.3, speed: 0.035, bodyParts: "quadruped" },
];

    // Dream post-processing shader — vignette + color grading
    const DreamShader = {
      uniforms: {
        tDiffuse: { value: null },
        vignetteIntensity: { value: 0.25 },
        chromaticAberration: { value: 0.0002 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float vignetteIntensity;
        uniform float chromaticAberration;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          float r = texture2D(tDiffuse, uv + vec2(chromaticAberration, 0.0)).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - vec2(chromaticAberration, 0.0)).b;
          vec3 color = vec3(r, g, b);
          // Color grading — lift shadows, push highlights warm
          color.r = color.r * 1.03 + 0.008;
          color.g = color.g * 1.0 + 0.005;
          color.b = color.b * 1.05 + 0.012;
          // Brightness boost
          color *= 1.1;
          // Contrast enhancement
          color = (color - 0.5) * 1.05 + 0.5;
          color = clamp(color, 0.0, 1.0);
          // Vignette
          float dist = distance(uv, vec2(0.5));
          float vignette = smoothstep(0.85, 0.45, dist);
          color *= mix(1.0 - vignetteIntensity, 1.0, vignette);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    };

export default function GameRenderer({ chunks, dayNight, playerPosition, playerRotation, weatherType, weatherIntensity, blockEvents, worldConfig, droppedItems, breakProgress, breakTarget }: GameRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ chunks, dayNight, playerPosition, playerRotation, weatherType: weatherType || "clear", weatherIntensity: weatherIntensity || 0, blockEvents: blockEvents || [], worldConfig, droppedItems: droppedItems || [], breakProgress: breakProgress || 0, breakTarget: breakTarget || { x: 0, y: 0, z: 0 } });

  useEffect(() => {
    stateRef.current = { chunks, dayNight, playerPosition, playerRotation, weatherType: weatherType || "clear", weatherIntensity: weatherIntensity || 0, blockEvents: blockEvents || [], worldConfig, droppedItems: droppedItems || [], breakProgress: breakProgress || 0, breakTarget: breakTarget || { x: 0, y: 0, z: 0 } };
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2;
    container.appendChild(renderer.domElement);

    // Scene — with distance-based fog
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(worldConfig?.fogColor || "#1a1545");
    scene.background = fogColor.clone();
    scene.fog = new THREE.FogExp2(fogColor, 0.006); // exponential fog for natural distance fade

    // Camera
    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, 500);

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.4, 0.8, 0.6
    );
    composer.addPass(bloomPass);
    const dreamPass = new ShaderPass(DreamShader);
    composer.addPass(dreamPass);

    // Lighting — bright dreamy atmosphere
    const sun = new THREE.DirectionalLight(0xffeedd, 2.4);
    sun.position.set(50, 100, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 150;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 3;
    scene.add(sun);
    const ambient = new THREE.HemisphereLight(0xb098d8, 0x3a2860, 0.7);
    scene.add(ambient);
    const fillLight = new THREE.DirectionalLight(0xd0a8e0, 0.25);
    fillLight.position.set(-30, -50, -20);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x80b0ff, 0.15);
    rimLight.position.set(0, 30, -80);
    scene.add(rimLight);
    const bounceLight = new THREE.DirectionalLight(0x6a4890, 0.15);
    bounceLight.position.set(0, -30, 0);
    scene.add(bounceLight);

    // ── Sky dome — bright dreamy gradient with horizon glow ──
    const skyGeo = new THREE.SphereGeometry(400, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(worldConfig?.skyTopColor || "#0c0820") },
        horizonColor: { value: new THREE.Color(worldConfig?.skyHorizonColor || "#2a1850") },
        bottomColor: { value: new THREE.Color("#14103a") },
        horizonGlowColor: { value: new THREE.Color(worldConfig?.accentColor || "#5a3880") },
        sunDirection: { value: new THREE.Vector3(0.5, 0.3, 0.3).normalize() },
        sunIntensity: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vNormal = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonGlowColor;
        uniform vec3 sunDirection;
        uniform float sunIntensity;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        void main() {
          float h = normalize(vNormal).y;
          // Sky gradient — top to horizon to bottom
          vec3 color;
          if (h > 0.0) {
            float t = pow(h, 0.4);
            color = mix(horizonColor, topColor, t);
          } else {
            color = mix(horizonColor, bottomColor, pow(-h, 0.6));
          }
          // Horizon glow — warm band at the horizon
          float horizonBand = exp(-abs(h) * 8.0) * 0.3;
          color += horizonGlowColor * horizonBand;
          // Sun glow — bright spot near sun direction
          float sunDot = max(dot(normalize(vNormal), sunDirection), 0.0);
          float sunGlow = pow(sunDot, 32.0) * sunIntensity * 0.5;
          float sunHalo = pow(sunDot, 4.0) * sunIntensity * 0.15;
          color += vec3(1.0, 0.9, 0.7) * sunGlow;
          color += vec3(0.8, 0.6, 0.4) * sunHalo;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // ── Moon ──
    const moonGeo = new THREE.SphereGeometry(8, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe8e0f0 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(100, 200, -150);
    scene.add(moon);
    // Moon glow
    const moonGlowGeo = new THREE.SphereGeometry(12, 32, 32);
    const moonGlowMat = new THREE.MeshBasicMaterial({ color: 0xc8b8e8, transparent: true, opacity: 0.15, side: THREE.BackSide });
    const moonGlow = new THREE.Mesh(moonGlowGeo, moonGlowMat);
    moonGlow.position.copy(moon.position);
    scene.add(moonGlow);

    // ── Stars with constellation patterns ──
    const starCount = 5000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 350 + Math.random() * 40;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)); // only upper hemisphere
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const colorChoice = Math.random();
      if (colorChoice < 0.4) { starColors[i*3] = 0.62; starColors[i*3+1] = 0.49; starColors[i*3+2] = 0.85; }
      else if (colorChoice < 0.7) { starColors[i*3] = 0.94; starColors[i*3+1] = 0.47; starColors[i*3+2] = 0.72; }
      else { starColors[i*3] = 0.97; starColors[i*3+1] = 0.84; starColors[i*3+2] = 0.44; }
      starSizes[i] = 0.5 + Math.random() * 2;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
    const starMat = new THREE.PointsMaterial({ size: 1.8, transparent: true, opacity: 0.7, vertexColors: true, sizeAttenuation: true });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── Constellation lines ──
    const constellations = [
      // Each constellation: array of star index pairs
      { name: "Dreamweaver", stars: [0,1, 1,2, 2,3, 3,4, 4,5, 2,6] },
      { name: "Void Serpent", stars: [10,11, 11,12, 12,13, 13,14, 14,15, 15,16] },
      { name: "Crystal Heart", stars: [20,21, 21,22, 22,23, 23,24, 24,20, 20,22] },
    ];
    for (const c of constellations) {
      const lineGeo = new THREE.BufferGeometry();
      const linePositions: number[] = [];
      for (let i = 0; i < c.stars.length; i += 2) {
        const a = c.stars[i], b = c.stars[i + 1];
        if (a < starCount && b < starCount) {
          linePositions.push(starPos[a*3], starPos[a*3+1], starPos[a*3+2]);
          linePositions.push(starPos[b*3], starPos[b*3+1], starPos[b*3+2]);
        }
      }
      lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0x9d7cd8, transparent: true, opacity: 0.15 });
      scene.add(new THREE.LineSegments(lineGeo, lineMat));
    }

    // ── Aurora borealis ribbons ──
    const auroraGroup = new THREE.Group();
    scene.add(auroraGroup);
    for (let i = 0; i < 3; i++) {
      const ribbonGeo = new THREE.PlaneGeometry(300, 30, 64, 8);
      const ribbonMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x2dd4a8 : i === 1 ? 0x9d7cd8 : 0xe879a8,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.position.set(0, 180 + i * 15, -100 - i * 30);
      ribbon.rotation.x = Math.PI * 0.3;
      auroraGroup.add(ribbon);
    }

    // ── Multi-layer parallax clouds ──
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);
    const cloudLayers = [
      { y: 120, speed: 0.0009, opacity: 0.08, count: 15 },
      { y: 150, speed: 0.0015, opacity: 0.05, count: 10 },
      { y: 180, speed: 0.0006, opacity: 0.03, count: 8 },
    ];
    const cloudMeshes: { mesh: THREE.Mesh; speed: number; baseX: number }[] = [];
    for (const layer of cloudLayers) {
      for (let i = 0; i < layer.count; i++) {
        const cloudGeo = new THREE.PlaneGeometry(40 + Math.random() * 60, 15 + Math.random() * 20);
        const cloudMat = new THREE.MeshBasicMaterial({
          color: 0xe8e0f0,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const cloud = new THREE.Mesh(cloudGeo, cloudMat);
        const cx = (Math.random() - 0.5) * 500;
        cloud.position.set(cx, layer.y + Math.random() * 20, (Math.random() - 0.5) * 500);
        cloud.rotation.x = -Math.PI * 0.4;
        cloudGroup.add(cloud);
        cloudMeshes.push({ mesh: cloud, speed: layer.speed, baseX: cx });
      }
    }

    // ── Ground mist layer ──
    const mistGeo = new THREE.PlaneGeometry(200, 200, 32, 32);
    const mistMat = new THREE.MeshBasicMaterial({
      color: 0x9d7cd8,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mist = new THREE.Mesh(mistGeo, mistMat);
    mist.rotation.x = -Math.PI / 2;
    mist.position.y = 70;
    scene.add(mist);

    // ── Ambient floating particles — static ──
    const apCount = 50;
    const apGeo = new THREE.BufferGeometry();
    const apPos = new Float32Array(apCount * 3);
    for (let i = 0; i < apCount; i++) {
      apPos[i*3] = (Math.random()-0.5)*80;
      apPos[i*3+1] = Math.random()*60 + 60;
      apPos[i*3+2] = (Math.random()-0.5)*80;
    }
    apGeo.setAttribute("position", new THREE.BufferAttribute(apPos, 3));
    const apMat = new THREE.PointsMaterial({ color: 0xb098d8, size: 1.0, transparent: true, opacity: 0.6, sizeAttenuation: true });
    const ambientParticles = new THREE.Points(apGeo, apMat);
    scene.add(ambientParticles);

    // ── Nebula clouds ──
    const nebulaGeo = new THREE.PlaneGeometry(200, 200);
    const nebulaMat = new THREE.MeshBasicMaterial({ color: 0x9d7cd8, transparent: true, opacity: 0.04, side: THREE.DoubleSide, depthWrite: false });
    const nebula1 = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebula1.position.set(0, 130, -100);
    scene.add(nebula1);
    const nebula2 = new THREE.Mesh(nebulaGeo, nebulaMat.clone());
    nebula2.material.color.set(0xe879a8);
    nebula2.material.opacity = 0.03;
    nebula2.position.set(80, 150, 50);
    scene.add(nebula2);

    // ── Weather particles — disabled (static world) ──
    const weatherGroup = new THREE.Group();
    scene.add(weatherGroup);

    // ── Shooting stars — disabled (static world) ──
    const shootingStarGroup = new THREE.Group();
    scene.add(shootingStarGroup);

    // ── Animals with enhanced shapes ──
    const animalMeshes: { mesh: THREE.Group; type: typeof ANIMAL_TYPES[0]; baseY: number; phase: number }[] = [];
    for (let i = 0; i < 80; i++) {
      const ax = (Math.random() - 0.5) * 300;
      const az = (Math.random() - 0.5) * 300;
      const ay = 75 + Math.random() * 15;
      const type = ANIMAL_TYPES[i % ANIMAL_TYPES.length];
      const group = new THREE.Group();

      if (type.bodyParts === "flying") {
        // Flying creatures — wings + body
        const bodyGeo = new THREE.SphereGeometry(type.size * 0.6, 8, 8);
        const bodyMat = new THREE.MeshLambertMaterial({ color: type.color, emissive: type.color, emissiveIntensity: 0.4 });
        group.add(new THREE.Mesh(bodyGeo, bodyMat));
        // Wings
        const wingGeo = new THREE.PlaneGeometry(type.size * 2, type.size * 0.8);
        const wingMat = new THREE.MeshBasicMaterial({ color: type.color, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
        const wing1 = new THREE.Mesh(wingGeo, wingMat);
        wing1.position.set(-type.size * 0.8, 0, 0);
        wing1.rotation.z = 0.3;
        group.add(wing1);
        const wing2 = new THREE.Mesh(wingGeo, wingMat);
        wing2.position.set(type.size * 0.8, 0, 0);
        wing2.rotation.z = -0.3;
        group.add(wing2);
      } else {
        // Quadrupeds — body + head + legs + tail
        const bodyGeo = new THREE.SphereGeometry(type.size, 8, 6);
        bodyGeo.scale(1.3, 0.8, 1);
        const bodyMat = new THREE.MeshLambertMaterial({ color: type.color, emissive: type.color, emissiveIntensity: 0.3 });
        group.add(new THREE.Mesh(bodyGeo, bodyMat));
        // Head
        const headGeo = new THREE.SphereGeometry(type.size * 0.5, 8, 8);
        const headMat = new THREE.MeshLambertMaterial({ color: type.color, emissive: type.color, emissiveIntensity: 0.3 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, type.size * 0.3, type.size * 0.9);
        group.add(head);
        // Eyes
        const eyeGeo = new THREE.SphereGeometry(type.size * 0.1, 6, 6);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
        eye1.position.set(-type.size * 0.2, type.size * 0.45, type.size * 1.2);
        group.add(eye1);
        const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
        eye2.position.set(type.size * 0.2, type.size * 0.45, type.size * 1.2);
        group.add(eye2);
        // Ears (for foxes, bunnies, cats)
        if (["dream_fox", "star_bunny", "void_cat", "cosmic_rabbit"].includes(type.type)) {
          const earGeo = new THREE.ConeGeometry(type.size * 0.15, type.size * 0.4, 6);
          const earMat = new THREE.MeshLambertMaterial({ color: type.color, emissive: type.color, emissiveIntensity: 0.2 });
          const ear1 = new THREE.Mesh(earGeo, earMat);
          ear1.position.set(-type.size * 0.2, type.size * 0.7, type.size * 0.8);
          group.add(ear1);
          const ear2 = new THREE.Mesh(earGeo, earMat);
          ear2.position.set(type.size * 0.2, type.size * 0.7, type.size * 0.8);
          group.add(ear2);
        }
        // Tail
        const tailGeo = new THREE.ConeGeometry(type.size * 0.12, type.size * 0.8, 6);
        const tailMat = new THREE.MeshLambertMaterial({ color: type.color, emissive: type.color, emissiveIntensity: 0.2 });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(0, type.size * 0.1, -type.size * 0.9);
        tail.rotation.x = -0.5;
        group.add(tail);
      }

      // Glow aura
      const glowGeo = new THREE.SphereGeometry(type.size * 1.5, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: type.color, transparent: true, opacity: 0.06 });
      group.add(new THREE.Mesh(glowGeo, glowMat));

      group.position.set(ax, ay, az);
      scene.add(group);
      animalMeshes.push({ mesh: group, type, baseY: ay, phase: Math.random() * Math.PI * 2 });
    }

    // ── Villagers with enhanced detail ──
    const villagerMeshes: { mesh: THREE.Group; baseX: number; baseZ: number; phase: number; type: string }[] = [];
    const villagerTypes = [
      { name: "starkeeper", bodyColor: 0xf0eaf8, robeColor: 0xa78bfa, glowColor: 0xa78bfa },
      { name: "cloud_shepherd", bodyColor: 0xd0c4e8, robeColor: 0x2dd4a8, glowColor: 0x2dd4a8 },
      { name: "void_merchant", bodyColor: 0xc8b8e8, robeColor: 0x6366f1, glowColor: 0x6366f1 },
      { name: "crystal_sage", bodyColor: 0xe8e0f0, robeColor: 0xf5d062, glowColor: 0xf5d062 },
      { name: "dream_weaver", bodyColor: 0xd8ccf0, robeColor: 0xe879a8, glowColor: 0xe879a8 },
    ];
    for (let i = 0; i < 30; i++) {
      const vx = (Math.random() - 0.5) * 300;
      const vz = (Math.random() - 0.5) * 300;
      const vType = villagerTypes[i % villagerTypes.length];
      const group = new THREE.Group();

      // Body
      const bodyGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.6, 8);
      const bodyMat = new THREE.MeshLambertMaterial({ color: vType.bodyColor, emissive: vType.bodyColor, emissiveIntensity: 0.1 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.8;
      group.add(body);

      // Robe
      const robeGeo = new THREE.CylinderGeometry(0.35, 0.5, 1.2, 8);
      const robeMat = new THREE.MeshLambertMaterial({ color: vType.robeColor, transparent: true, opacity: 0.4, emissive: vType.robeColor, emissiveIntensity: 0.15 });
      const robe = new THREE.Mesh(robeGeo, robeMat);
      robe.position.y = 0.6;
      group.add(robe);

      // Head
      const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const headMat = new THREE.MeshLambertMaterial({ color: 0xe0d0f0, emissive: 0xe0d0f0, emissiveIntensity: 0.1 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.7;
      group.add(head);

      // Glowing orb above head
      const orbGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const orbMat = new THREE.MeshBasicMaterial({ color: vType.glowColor, transparent: true, opacity: 0.7 });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.y = 2.1;
      group.add(orb);

      // Orb glow
      const orbGlowGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const orbGlowMat = new THREE.MeshBasicMaterial({ color: vType.glowColor, transparent: true, opacity: 0.15 });
      const orbGlow = new THREE.Mesh(orbGlowGeo, orbGlowMat);
      orbGlow.position.y = 2.1;
      group.add(orbGlow);

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.8, 6);
      const armMat = new THREE.MeshLambertMaterial({ color: vType.bodyColor });
      const arm1 = new THREE.Mesh(armGeo, armMat);
      arm1.position.set(-0.4, 0.9, 0);
      arm1.rotation.z = 0.3;
      group.add(arm1);
      const arm2 = new THREE.Mesh(armGeo, armMat);
      arm2.position.set(0.4, 0.9, 0);
      arm2.rotation.z = -0.3;
      group.add(arm2);

      group.position.set(vx, 75, vz);
      scene.add(group);
      villagerMeshes.push({ mesh: group, baseX: vx, baseZ: vz, phase: Math.random() * Math.PI * 2, type: vType.name });
    }

    // ── Chunk meshes ──
    const meshMap = new Map<string, THREE.Mesh>();
    const transparentMeshMap = new Map<string, THREE.Mesh>();

    // Custom leaf/plant shader with wind, subsurface scattering, and bioluminescence
    const plantShaderMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 color;
        uniform float time;
        uniform float windStrength;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vColor = color;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform float sunIntensity;
        uniform float ambientIntensity;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          float NdotL = max(dot(vNormal, sunDirection), 0.0);
          float sss = max(0.0, dot(-sunDirection, vNormal)) * 0.5;
          float wrap = (NdotL + sss) * 0.5 + 0.5;
          vec3 diffuse = vColor * sunColor * wrap * sunIntensity;
          vec3 ambient = vColor * ambientIntensity * 0.35;
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
          rim = pow(rim, 3.0) * 0.12;
          vec3 rimColor = vColor * rim;
          vec3 finalColor = diffuse + ambient + rimColor;
          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
      uniforms: {
        sunDirection: { value: new THREE.Vector3(0.5, 1, 0.3).normalize() },
        sunColor: { value: new THREE.Color(0xffeedd) },
        sunIntensity: { value: 1.0 },
        ambientIntensity: { value: 0.7 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Water shader — bright still reflective pool
    const waterShaderMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        uniform float sunIntensity;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
          vec3 deepColor = vec3(0.18, 0.28, 0.6);
          vec3 shallowColor = vec3(0.35, 0.5, 0.8);
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 4.0);
          vec3 halfDir = normalize(sunDirection + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 128.0) * sunIntensity;
          vec3 specColor = vec3(1.0, 0.95, 0.85) * spec * 0.7;
          float depthFactor = smoothstep(0.0, 2.0, vWorldPos.y - 70.0);
          vec3 waterColor = mix(deepColor, shallowColor, depthFactor);
          vec3 skyReflect = vec3(0.12, 0.12, 0.3);
          vec3 finalColor = mix(waterColor, skyReflect, fresnel * 0.5) + specColor;
          float alpha = 0.7 + fresnel * 0.2;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      uniforms: {
        sunDirection: { value: new THREE.Vector3(0.5, 1, 0.3).normalize() },
        sunIntensity: { value: 1.0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // ── Firefly particles — static points, only visible at night ──
    const fireflyCount = 20;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPos = new Float32Array(fireflyCount * 3);
    const fireflyColors = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount; i++) {
      fireflyPos[i*3] = (Math.random()-0.5)*100;
      fireflyPos[i*3+1] = 75 + Math.random()*10;
      fireflyPos[i*3+2] = (Math.random()-0.5)*100;
      const hue = Math.random();
      if (hue < 0.6) { fireflyColors[i*3] = 0.7; fireflyColors[i*3+1] = 0.8; fireflyColors[i*3+2] = 0.3; }
      else { fireflyColors[i*3] = 0.5; fireflyColors[i*3+1] = 0.7; fireflyColors[i*3+2] = 0.8; }
    }
    fireflyGeo.setAttribute("position", new THREE.BufferAttribute(fireflyPos, 3));
    fireflyGeo.setAttribute("color", new THREE.BufferAttribute(fireflyColors, 3));
    const fireflyMat = new THREE.PointsMaterial({ size: 0.6, transparent: true, opacity: 0, vertexColors: true, sizeAttenuation: true, blending: THREE.AdditiveBlending });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);

    // ── Ground glow — bioluminescent ground at night ──
    const groundGlowGeo = new THREE.PlaneGeometry(200, 200, 32, 32);
    const groundGlowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float nightGlow;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          float pattern1 = sin(vWorldPos.x * 0.5) * cos(vWorldPos.z * 0.4);
          float pattern2 = cos(vWorldPos.x * 0.3) * sin(vWorldPos.z * 0.6);
          float pattern3 = sin((vWorldPos.x + vWorldPos.z) * 0.2);
          float bio = (pattern1 + pattern2 + pattern3) * 0.33 * 0.5 + 0.5;
          bio = pow(bio, 2.0);
          vec3 glowColor = vec3(0.4, 0.25, 0.7) * bio * nightGlow * 0.2;
          float dist = length(vUv - 0.5) * 2.0;
          float fade = smoothstep(1.0, 0.3, dist);
          gl_FragColor = vec4(glowColor, bio * nightGlow * 0.15 * fade);
        }
      `,
      uniforms: {
        nightGlow: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const groundGlow = new THREE.Mesh(groundGlowGeo, groundGlowMat);
    groundGlow.rotation.x = -Math.PI / 2;
    groundGlow.position.y = 72;
    scene.add(groundGlow);

    // ── Dropped items rendering ──
    const droppedItemsGroup = new THREE.Group();
    scene.add(droppedItemsGroup);
    const droppedItemMeshes = new Map<string, THREE.Mesh>();
    const droppedItemGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);

    const updateDroppedItems = (items: Array<{ id: string; blockId: number; x: number; y: number; z: number; age: number }>) => {
      const currentIds = new Set(items.map((i) => i.id));
      // Remove old meshes
      for (const [id, mesh] of droppedItemMeshes) {
        if (!currentIds.has(id)) {
          droppedItemsGroup.remove(mesh);
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
          droppedItemMeshes.delete(id);
        }
      }
      // Add/update meshes
      for (const item of items) {
        let mesh = droppedItemMeshes.get(item.id);
        if (!mesh) {
          const blockDef = getBlockDef(item.blockId);
          const mat = new THREE.MeshStandardMaterial({
            color: blockDef.color,
            emissive: blockDef.emissive ? blockDef.color : 0x000000,
            emissiveIntensity: blockDef.emissive ? 0.5 : 0,
            roughness: 0.7,
            metalness: 0.1,
          });
          mesh = new THREE.Mesh(droppedItemGeo, mat);
          droppedItemsGroup.add(mesh);
          droppedItemMeshes.set(item.id, mesh);
        }
        mesh.position.set(item.x, item.y, item.z);
        mesh.rotation.y = item.age * 2;
        mesh.rotation.x = Math.sin(item.age * 1.5) * 0.3;
        const scale = 0.3 + Math.sin(item.age * 4) * 0.05;
        mesh.scale.set(scale, scale, scale);
      }
    };

    // ── Break progress overlay ──
    const breakOverlayGeo = new THREE.BoxGeometry(1.005, 1.005, 1.005);
    const breakOverlayMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      wireframe: false,
      depthTest: true,
    });
    const breakOverlay = new THREE.Mesh(breakOverlayGeo, breakOverlayMat);
    breakOverlay.renderOrder = 999;
    scene.add(breakOverlay);
    // Crack lines
    const crackGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01, 1.01, 1.01));
    const crackMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const crackLines = new THREE.LineSegments(crackGeo, crackMat);
    crackLines.renderOrder = 1000;
    scene.add(crackLines);

    // ── Render loop ──
    let raf: number;
    let frameCount = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      frameCount++;
      const time = frameCount * 0.016;
      const { chunks: currentChunks, dayNight: dn, playerPosition: pos, playerRotation: rot, worldConfig: wc } = stateRef.current;

      // Camera
      camera.position.set(pos.x, pos.y + 1.62, pos.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = rot.y;
      camera.rotation.x = rot.x;

      // Day/night
      sun.intensity = dn.sunIntensity;
      sun.position.set(Math.cos(dn.sunAngle) * 100, Math.sin(dn.sunAngle) * 100 + 50, 30);
      ambient.color.set(dn.ambientColor);
      const baseFogColor = wc?.fogColor || "#1a1545";
      (scene.background as THREE.Color).set(baseFogColor).lerp(new THREE.Color(dn.fogColor), 0.5);
      if (scene.fog) (scene.fog as THREE.FogExp2).color.set(baseFogColor).lerp(new THREE.Color(dn.fogColor), 0.5);
      starMat.opacity = dn.starVisibility * 0.5;

      // Sky dome follows camera
      sky.position.set(pos.x, pos.y, pos.z);
      const baseSkyTop = wc?.skyTopColor || "#0c0820";
      const baseSkyHorizon = wc?.skyHorizonColor || "#2a1850";
      skyMat.uniforms.topColor.value.set(baseSkyTop).lerp(new THREE.Color(dn.fogColor), 0.3);
      skyMat.uniforms.horizonColor.value.set(baseSkyHorizon);
      skyMat.uniforms.sunDirection.value.set(Math.cos(dn.sunAngle), Math.sin(dn.sunAngle), 0.3).normalize();
      skyMat.uniforms.sunIntensity.value = dn.sunIntensity * 0.5;

      // Moon follows camera (parallax)
      moon.position.set(pos.x + 100, 200, pos.z - 150);
      moonGlow.position.copy(moon.position);
      moonMat.opacity = dn.starVisibility;
      moonGlowMat.opacity = dn.starVisibility * 0.15;

      // Aurora — only visible at night, static
      auroraGroup.visible = dn.starVisibility > 0.3;
      for (let i = 0; i < auroraGroup.children.length; i++) {
        const ribbon = auroraGroup.children[i] as THREE.Mesh;
        (ribbon.material as THREE.MeshBasicMaterial).opacity = dn.starVisibility * 0.06;
      }

      // Clouds — static
      for (const cloud of cloudMeshes) {
        cloud.mesh.position.z = cloud.mesh.position.z;
      }

      // Mist follows camera
      mist.position.set(pos.x, 70, pos.z);
      (mist.material as THREE.MeshBasicMaterial).opacity = 0.04;

      // Weather — disabled (static world)

      // Shooting stars — disabled

      // Ambient particles — static (no update needed)

      // Animate animals — very slow, calm
      for (const animal of animalMeshes) {
        animal.mesh.position.x += Math.sin(time * animal.type.speed * 3 + animal.phase) * 0.015;
        animal.mesh.position.z += Math.cos(time * animal.type.speed * 2.5 + animal.phase) * 0.015;
        animal.mesh.position.y = animal.baseY + Math.sin(time * 0.8 + animal.phase) * 0.1;
        animal.mesh.rotation.y = Math.atan2(
          Math.sin(time * animal.type.speed * 3 + animal.phase),
          Math.cos(time * animal.type.speed * 2.5 + animal.phase)
        );
        // Wing flap for flying creatures — slow
        if (animal.type.bodyParts === "flying") {
          const wing1 = animal.mesh.children[1] as THREE.Mesh;
          const wing2 = animal.mesh.children[2] as THREE.Mesh;
          if (wing1) wing1.rotation.z = 0.3 + Math.sin(time * 3 + animal.phase) * 0.3;
          if (wing2) wing2.rotation.z = -0.3 - Math.sin(time * 3 + animal.phase) * 0.3;
        }
        // Glow pulse — very slow breathing
        const glowChild = animal.mesh.children[animal.mesh.children.length - 1] as THREE.Mesh;
        if (glowChild) {
          (glowChild.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(time * 0.5 + animal.phase) * 0.02;
        }
      }

      // Animate villagers — very slow, calm
      for (const villager of villagerMeshes) {
        villager.mesh.position.x = villager.baseX + Math.sin(time * 0.1 + villager.phase) * 3;
        villager.mesh.position.z = villager.baseZ + Math.cos(time * 0.08 + villager.phase) * 3;
        villager.mesh.rotation.y = Math.atan2(
          Math.sin(time * 0.1 + villager.phase),
          Math.cos(time * 0.08 + villager.phase)
        );
        // Orb pulse — slow breathing
        const orb = villager.mesh.children[3] as THREE.Mesh;
        const orbGlow = villager.mesh.children[4] as THREE.Mesh;
        if (orb) (orb.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 0.4 + villager.phase) * 0.2;
        if (orbGlow) (orbGlow.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(time * 0.3 + villager.phase) * 0.05;
        // Arm swing — very slow
        const arm1 = villager.mesh.children[6] as THREE.Mesh;
        const arm2 = villager.mesh.children[7] as THREE.Mesh;
        if (arm1) arm1.rotation.x = Math.sin(time * 0.5 + villager.phase) * 0.15;
        if (arm2) arm2.rotation.x = -Math.sin(time * 0.5 + villager.phase) * 0.15;
      }

      // Nebula and stars — static

      // Update dream shader
      dreamPass.uniforms.chromaticAberration.value = 0.0003;

      // Update chunk meshes
      const currentKeys = new Set(currentChunks.keys());
      for (const [key, m] of meshMap) {
        if (!currentKeys.has(key)) {
          scene.remove(m);
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
          meshMap.delete(key);
        }
      }
      for (const [key, m] of transparentMeshMap) {
        if (!currentKeys.has(key)) {
          scene.remove(m);
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
          transparentMeshMap.delete(key);
        }
      }

      let built = 0;
      for (const [key, chunk] of currentChunks) {
        if (!chunk.dirty) continue;
        if (built >= 3) break;

        // Remove old meshes
        const old = meshMap.get(key);
        if (old) { scene.remove(old); old.geometry.dispose(); }
        const oldT = transparentMeshMap.get(key);
        if (oldT) { scene.remove(oldT); oldT.geometry.dispose(); }

        const data = buildChunkMesh(chunk, null);

        // Opaque geometry (blocks)
        if (data.positions.length > 0) {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
          geo.setAttribute("normal", new THREE.BufferAttribute(data.normals, 3));
          geo.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));
          geo.setIndex(new THREE.BufferAttribute(data.indices, 1));
          const mat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            side: THREE.FrontSide,
            roughness: 0.85,
            metalness: 0.05,
            envMapIntensity: 0.3,
          });
          const m = new THREE.Mesh(geo, mat);
          scene.add(m);
          meshMap.set(key, m);
        }

        // Transparent/plant geometry (flowers, ferns, mushrooms, glass, leaves)
        if (data.transparentPositions.length > 0) {
          const tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(data.transparentPositions, 3));
          tGeo.setAttribute("normal", new THREE.BufferAttribute(data.transparentNormals, 3));
          tGeo.setAttribute("color", new THREE.BufferAttribute(data.transparentColors, 3));
          tGeo.setIndex(new THREE.BufferAttribute(data.transparentIndices, 1));
          const tMat = plantShaderMat.clone();
          const tMesh = new THREE.Mesh(tGeo, tMat);
          scene.add(tMesh);
          transparentMeshMap.set(key, tMesh);
        }

        chunk.dirty = false;
        built++;
      }

      // Update plant shader uniforms with current sun position
      const sunDir = new THREE.Vector3(Math.cos(dn.sunAngle), Math.sin(dn.sunAngle) + 0.5, 0.3).normalize();
      for (const [, m] of transparentMeshMap) {
        const mat = m.material as THREE.ShaderMaterial;
        if (mat.uniforms) {
          mat.uniforms.sunDirection.value.copy(sunDir);
          mat.uniforms.sunIntensity.value = dn.sunIntensity;
          mat.uniforms.ambientIntensity.value = dn.starVisibility > 0.3 ? 0.3 : 0.5;
        }
      }

      // Fireflies — static, visible at night
      fireflyMat.opacity = dn.starVisibility * 0.8;

      // Update ground glow
      groundGlow.position.set(pos.x, 72, pos.z);
      groundGlowMat.uniforms.nightGlow.value = dn.starVisibility;

      // Update water shader
      waterShaderMat.uniforms.sunDirection.value.copy(sunDir);
      waterShaderMat.uniforms.sunIntensity.value = dn.sunIntensity;

      // Update dropped items
      updateDroppedItems(stateRef.current.droppedItems || []);

      // Update break progress overlay
      const bp = stateRef.current.breakProgress;
      const bt = stateRef.current.breakTarget;
      if (bp > 0 && bt.x !== 0 && bt.y !== 0 && bt.z !== 0) {
        breakOverlay.position.set(bt.x + 0.5, bt.y + 0.5, bt.z + 0.5);
        breakOverlayMat.opacity = 0.15 + bp * 0.2;
        breakOverlayMat.color.setHex(bp > 0.7 ? 0xff4444 : bp > 0.4 ? 0xffaa44 : 0xffffff);
        crackLines.position.copy(breakOverlay.position);
        crackMat.opacity = bp * 0.8;
      } else {
        breakOverlayMat.opacity = 0;
        crackMat.opacity = 0;
      }

      composer.render();
    };
    raf = requestAnimationFrame(render);

    const resize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="dw-renderer" />;
}
