"use client";

import ReflectionRoom from "@/components/reflection-room/ReflectionRoom";

export default function ReflectionRoomPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="global-corners" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 pt-16">
          <ReflectionRoom />
        </div>
      </div>
    </main>
  );
}
