"use client";

import FeatureGate from "@/components/FeatureGate";
import MuralPage from "@/components/mural/MuralPage";

export default function MuralRoute() {
  return (
    <FeatureGate featureId="mural">
      <MuralPage />
    </FeatureGate>
  );
}
