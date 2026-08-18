"use client";

import FeatureGate from "@/components/FeatureGate";
import TarotPage from "@/components/tarot/TarotPage";

export default function TarotRoute() {
  return (
    <FeatureGate featureId="tarot">
      <TarotPage />
    </FeatureGate>
  );
}
