"use client";

import Link from "next/link";
import { useIsPlus } from "@/lib/premium";

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
  className?: string;
}

export default function PremiumGate({ children, feature, className = "" }: PremiumGateProps) {
  const isPlus = useIsPlus();

  if (isPlus) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="sanctuary-glass-card rounded-2xl p-6 max-w-sm mx-4 text-center">
          <div className="text-2xl mb-3">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-elovayne-violet/15 border border-elovayne-violet/25 text-elovayne-violet text-xs font-body font-medium tracking-wider">
              ✦ PLUS
            </span>
          </div>
          <h3 className="font-heading text-lg text-elovayne-light mb-2">
            {feature ? `${feature}` : "Plus Feature"}
          </h3>
          <p className="text-elovayne-dim text-xs mb-4 leading-relaxed">
            Unlock this and more with Elovayne Plus — £4.99/month
          </p>
          <Link
            href="/shop#membership"
            className="inline-block px-6 py-2.5 rounded-xl text-xs font-body font-medium shop-btn-primary"
          >
            Upgrade to Plus
          </Link>
        </div>
      </div>
      <div className="pointer-events-none blur-[2px] opacity-40 select-none" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
