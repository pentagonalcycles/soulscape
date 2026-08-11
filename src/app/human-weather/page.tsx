"use client";

import Navigation from "@/components/Navigation";
import HumanWeather from "@/components/human-weather/HumanWeather";

export default function HumanWeatherPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navigation activePage="human weather" />
      <HumanWeather />
    </main>
  );
}
