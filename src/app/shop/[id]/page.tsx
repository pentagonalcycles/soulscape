"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ShopProductImage from "@/components/ShopProductImage";
import { getProductById, ALL_SHOP_PRODUCTS, type ShopProduct } from "@/lib/shop-data";

interface BasketItem {
  product: ShopProduct;
  quantity: number;
}

function loadBasket(): BasketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("elovayne-basket");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBasket(items: BasketItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("elovayne-basket", JSON.stringify(items));
}

export default function ShopProductPage() {
  const params = useParams();
  const router = useRouter();
  const [basket, setBasket] = useState<BasketItem[]>(() => loadBasket());
  const [added, setAdded] = useState(false);

  const productId = params.id as string;
  const product = getProductById(productId);

  const addToBasket = useCallback(
    (p: ShopProduct) => {
      setBasket((prev) => {
        const existing = prev.find((item) => item.product.id === p.id);
        const next = existing
          ? prev.map((item) => (item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item))
          : [...prev, { product: p, quantity: 1 }];
        saveBasket(next);
        return next;
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    },
    []
  );

  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  const related = product
    ? ALL_SHOP_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)
    : [];

  if (!product) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="global-corners" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navigation />
          <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="text-3xl mb-4">◈</div>
              <h1 className="text-2xl font-heading text-elovayne-light mb-2">Product not found</h1>
              <p className="text-elovayne-dim text-sm mb-6">This product may have been removed.</p>
              <Link
                href="/shop"
                className="text-elovayne-violet text-sm hover:text-elovayne-light transition-colors"
              >
                ← Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(13, 148, 136, 0.03) 100%)",
          zIndex: 2,
        }}
      />
      <div className="global-corners" />
      <div className="global-corners-extra" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation activePage="shop" />

        {/* Basket button */}
        {basketCount > 0 && (
          <motion.button
            className="fixed top-6 right-6 z-40 w-12 h-12 rounded-full sanctuary-glass-card flex items-center justify-center hover:border-elovayne-violet/30 transition-all duration-300"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => router.push("/shop")}
            aria-label={`View basket, ${basketCount} items`}
          >
            <span className="text-elovayne-violet text-lg">◈</span>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-elovayne-violet text-white text-[10px] font-body font-medium flex items-center justify-center">
              {basketCount}
            </span>
          </motion.button>
        )}

        <div className="flex-1 pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/shop"
                className="text-elovayne-dim text-xs hover:text-elovayne-violet transition-colors mb-8 inline-block"
              >
                ← Back to Shop
              </Link>
            </motion.div>

            {/* Main product layout */}
            <motion.div
              className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Product image */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden">
                  <ShopProductImage category={product.category} name={product.name} size="lg" className="mx-auto" />
                </div>
                {/* Ambient glow */}
                <div
                  className="absolute -inset-8 pointer-events-none rounded-3xl opacity-30"
                  style={{
                    background: "radial-gradient(circle at 50% 50%, rgba(157,124,216,0.08) 0%, transparent 70%)",
                  }}
                />
              </div>

              {/* Product info */}
              <div className="flex flex-col">
                <span className="text-[10px] font-body uppercase tracking-[0.15em] text-elovayne-dim mb-3 block">
                  {product.categoryLabel}
                </span>

                <h1 className="text-3xl md:text-4xl font-heading text-elovayne-light glow-text mb-4">
                  {product.name}
                </h1>

                <p className="text-elovayne-muted font-body leading-relaxed mb-6">
                  {product.longDescription}
                </p>

                {/* Details */}
                {product.includes && product.includes.length > 0 && (
                  <div className="mb-6 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <h3 className="text-[10px] font-body uppercase tracking-wider text-elovayne-dim mb-3">
                      What&apos;s Included
                    </h3>
                    <ul className="space-y-2">
                      {product.includes.map((item, i) => (
                        <li key={i} className="text-elovayne-muted text-sm flex items-start gap-2.5">
                          <span className="text-elovayne-violet mt-0.5 shrink-0">◈</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-heading text-elovayne-gold">
                    £{product.price.toFixed(2)}
                  </span>
                  <span className="text-elovayne-dim text-xs uppercase tracking-wider">Digital Download</span>
                </div>

                {/* Add to basket */}
                <button
                  onClick={() => addToBasket(product)}
                  className={`w-full py-4 rounded-xl text-sm font-body font-medium transition-all duration-500 ${
                    added
                      ? "bg-elovayne-gold/20 border border-elovayne-gold/40 text-elovayne-gold"
                      : "shop-btn-primary"
                  }`}
                >
                  {added ? "Added to Basket ✓" : "Add to Basket"}
                </button>

                <p className="text-elovayne-dim/60 text-[10px] text-center mt-4">
                  Secure payment via Stripe. Refunds available within 24 hours if file has not been downloaded.
                </p>
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="grid grid-cols-3 gap-4 mb-16 max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                { icon: "🔒", label: "Secure Payment" },
                { icon: "⬇", label: "Instant Download" },
                { icon: "↺", label: "24h Refund" },
              ].map((badge, i) => (
                <div key={i} className="text-center py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-lg mb-1">{badge.icon}</div>
                  <span className="text-elovayne-dim text-[10px]">{badge.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Related products */}
            {related.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-xl md:text-2xl font-heading text-elovayne-light mb-2">
                    You May Also Like
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="w-12 h-px bg-gradient-to-r from-transparent to-elovayne-violet/30" />
                    <span className="text-elovayne-violet/40 text-[10px]">◈</span>
                    <span className="w-12 h-px bg-gradient-to-l from-transparent to-elovayne-violet/30" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  {related.map((p) => (
                    <Link
                      key={p.id}
                      href={`/shop/${p.id}`}
                      className="sanctuary-glass-card rounded-2xl overflow-hidden group transition-all duration-300 hover:border-elovayne-violet/25"
                    >
                      <div className="relative">
                        <ShopProductImage category={p.category} name={p.name} size="sm" />
                      </div>
                      <div className="p-4">
                        <span className="text-[9px] font-body uppercase tracking-[0.15em] text-elovayne-dim block mb-1">
                          {p.categoryLabel}
                        </span>
                        <h3 className="font-heading text-sm text-elovayne-light mb-1 group-hover:text-elovayne-violet transition-colors">
                          {p.name}
                        </h3>
                        <span className="text-elovayne-gold font-heading text-base">£{p.price.toFixed(2)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
