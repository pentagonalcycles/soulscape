"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShopProductImage from "@/components/ShopProductImage";
import {
  CATEGORIES,
  FEATURED_PRODUCTS,
  JOURNALS,
  WALLPAPERS,
  SOUNDSCAPES,
  PROFILE_THEMES,
  MEMBERSHIP_PRODUCT,
  GIFT_OPTIONS,
  SUPPORT_AMOUNTS,
  TRUST_ITEMS,
  type ShopProduct,
} from "@/lib/shop-data";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const sectionFade = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/* ─── Hero particles ─── */
const HERO_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: 1 + (i % 5) * 0.5,
  duration: 4 + (i % 7),
  delay: (i % 4) * 0.7,
}));

function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {HERO_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#00ff88" : "#00cc6a",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0], y: [0, -20, -40] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Category filter bar ─── */
function CategoryBar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="shop-category-bar">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`shop-category-pill shrink-0 ${active === cat.id ? "active" : ""}`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Section header ─── */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      className="text-center mb-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={sectionFade}
    >
      <h2 className="text-2xl md:text-3xl font-heading glow-text-strong mb-3">{title}</h2>
      {subtitle && <p className="text-elovayne-muted text-sm max-w-md mx-auto">{subtitle}</p>}
      <div className="flex items-center justify-center gap-3 mt-4">
        <span className="w-16 h-px bg-gradient-to-r from-transparent to-elovayne-violet/30" />
        <span className="text-elovayne-violet/50 text-[10px] tracking-[0.3em] uppercase">◈</span>
        <span className="w-16 h-px bg-gradient-to-l from-transparent to-elovayne-violet/30" />
      </div>
    </motion.div>
  );
}

/* ─── Product card ─── */
function ProductCard({
  product,
  index,
  onPreview,
  onAddToBasket,
}: {
  product: ShopProduct;
  index: number;
  onPreview: (p: ShopProduct) => void;
  onAddToBasket: (p: ShopProduct) => void;
}) {
  return (
    <motion.div
      className="shop-product-card glass-elevated rounded-2xl overflow-hidden group"
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
    >
      <div className="relative">
        <ShopProductImage category={product.category} name={product.name} />
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-body uppercase tracking-wider bg-elovayne-violet/20 text-elovayne-violet border border-elovayne-violet/20 backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <span className="text-[10px] font-body uppercase tracking-[0.15em] text-elovayne-dim mb-1.5 block">
          {product.categoryLabel}
        </span>
        <h3 className="font-heading text-lg text-elovayne-light mb-2 group-hover:text-elovayne-violet transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-elovayne-dim text-xs leading-relaxed mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-elovayne-gold font-heading text-xl">£{product.price.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(product)}
            className="flex-1 py-2.5 rounded-xl text-xs font-body font-medium border border-elovayne-violet/20 text-elovayne-muted hover:text-elovayne-light hover:border-elovayne-violet/40 transition-all duration-300"
          >
            Preview
          </button>
          <button
            onClick={() => onAddToBasket(product)}
            className="flex-1 py-2.5 rounded-xl text-xs font-body font-medium shop-btn-primary"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Featured card ─── */
function FeaturedCard({
  product,
  index,
  onPreview,
  onAddToBasket,
}: {
  product: ShopProduct;
  index: number;
  onPreview: (p: ShopProduct) => void;
  onAddToBasket: (p: ShopProduct) => void;
}) {
  return (
    <motion.div
      className="shop-featured-card glass-elevated rounded-2xl overflow-hidden group"
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
    >
      <div className="relative">
        <ShopProductImage category={product.category} name={product.name} size="lg" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-body uppercase tracking-wider bg-elovayne-gold/15 text-elovayne-gold border border-elovayne-gold/20 backdrop-blur-sm">
          {product.badge || "Featured"}
        </span>
      </div>
      <div className="p-6">
        <span className="text-[10px] font-body uppercase tracking-[0.15em] text-elovayne-dim mb-2 block">
          {product.categoryLabel}
        </span>
        <h3 className="font-heading text-xl text-elovayne-light mb-2 group-hover:text-elovayne-violet transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-elovayne-muted text-sm leading-relaxed mb-4">{product.description}</p>
        <span className="text-elovayne-gold font-heading text-2xl block mb-5">£{product.price.toFixed(2)}</span>
        <div className="flex gap-3">
          <button
            onClick={() => onPreview(product)}
            className="flex-1 py-3 rounded-xl text-sm font-body font-medium border border-elovayne-violet/20 text-elovayne-muted hover:text-elovayne-light hover:border-elovayne-violet/40 transition-all duration-300"
          >
            Preview
          </button>
          <button
            onClick={() => onAddToBasket(product)}
            className="flex-1 py-3 rounded-xl text-sm font-body font-medium shop-btn-primary"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Soundscape card with preview ─── */
function SoundscapeCard({
  product,
  index,
  onPreview,
  onAddToBasket,
}: {
  product: ShopProduct;
  index: number;
  onPreview: (p: ShopProduct) => void;
  onAddToBasket: (p: ShopProduct) => void;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      className="shop-product-card glass-elevated rounded-2xl overflow-hidden group"
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
    >
      <div className="relative">
        <ShopProductImage category="soundscapes" name={product.name} />
      </div>
      <div className="p-5">
        <span className="text-[10px] font-body uppercase tracking-[0.15em] text-elovayne-dim mb-1.5 block">
          Soundscape
        </span>
        <h3 className="font-heading text-lg text-elovayne-light mb-2 group-hover:text-elovayne-violet transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-elovayne-dim text-xs leading-relaxed mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-elovayne-gold font-heading text-xl">£{product.price.toFixed(2)}</span>
          <button
            onClick={() => setPlaying(!playing)}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-elovayne-violet/30 text-elovayne-violet hover:bg-elovayne-violet/10 transition-all duration-300"
            aria-label={playing ? "Pause preview" : "Play preview"}
          >
            <span className="text-xs">{playing ? "❚❚" : "▶"}</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(product)}
            className="flex-1 py-2.5 rounded-xl text-xs font-body font-medium border border-elovayne-violet/20 text-elovayne-muted hover:text-elovayne-light hover:border-elovayne-violet/40 transition-all duration-300"
          >
            Preview
          </button>
          <button
            onClick={() => onAddToBasket(product)}
            className="flex-1 py-2.5 rounded-xl text-xs font-body font-medium shop-btn-primary"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Gift section card ─── */
function GiftCard({
  product,
  index,
  onAddToBasket,
}: {
  product: ShopProduct;
  index: number;
  onAddToBasket: (p: ShopProduct) => void;
}) {
  return (
    <motion.div
      className="shop-product-card glass-elevated rounded-2xl overflow-hidden group"
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
    >
      <div className="relative">
        <ShopProductImage category="gifts" name={product.name} />
      </div>
      <div className="p-5">
        <span className="text-[10px] font-body uppercase tracking-[0.15em] text-elovayne-dim mb-1.5 block">
          Gift
        </span>
        <h3 className="font-heading text-lg text-elovayne-light mb-2 group-hover:text-elovayne-violet transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-elovayne-dim text-xs leading-relaxed mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-elovayne-gold font-heading text-xl">£{product.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToBasket(product)}
            className="py-2.5 px-5 rounded-xl text-xs font-body font-medium shop-btn-primary"
          >
            Gift This
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Basket side panel ─── */
function BasketPanel({
  items,
  onRemove,
  onUpdateQuantity,
  onCheckout,
  onClose,
}: {
  items: BasketItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onCheckout: () => void;
  onClose: () => void;
}) {
  const [discountCode, setDiscountCode] = useState("");
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md h-full bg-[rgba(0, 255, 136, 0.06)]/95 backdrop-blur-xl border-l border-elovayne-violet/10 flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-elovayne-violet/10">
          <h3 className="font-heading text-xl text-elovayne-light">Your Basket</h3>
          <button onClick={onClose} className="text-elovayne-dim hover:text-elovayne-light transition-colors text-lg" aria-label="Close basket">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl mb-3">◈</div>
              <p className="text-elovayne-dim text-sm">Your basket is empty</p>
              <p className="text-elovayne-dim/60 text-xs mt-1">Browse the collection to find something meaningful</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <ShopProductImage category={item.product.category} name={item.product.name} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-sm text-elovayne-light truncate">{item.product.name}</h4>
                  <p className="text-elovayne-dim text-[10px]">{item.product.categoryLabel}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      className="w-6 h-6 rounded border border-elovayne-violet/20 text-elovayne-dim text-xs flex items-center justify-center hover:border-elovayne-violet/40 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-elovayne-light text-xs w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded border border-elovayne-violet/20 text-elovayne-dim text-xs flex items-center justify-center hover:border-elovayne-violet/40 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-elovayne-gold font-heading text-sm">
                    £{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="block mt-1 text-elovayne-dim text-[10px] hover:text-elovayne-cosmic-pink transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-elovayne-violet/10 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Discount code"
                className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-elovayne-violet/10 text-elovayne-light text-xs font-body placeholder:text-elovayne-dim/40 focus:outline-none focus:border-elovayne-violet/30 transition-colors"
              />
              <button
                onClick={() => {
                  if (discountCode.trim()) {
                    alert("Discount code applied: " + discountCode);
                  }
                }}
                className="px-4 py-2 rounded-lg border border-elovayne-violet/20 text-elovayne-dim text-xs hover:border-elovayne-violet/40 transition-colors"
              >
                Apply
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-elovayne-dim">Subtotal</span>
                <span className="text-elovayne-light">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-heading">
                <span className="text-elovayne-light">Total</span>
                <span className="text-elovayne-gold">£{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3.5 rounded-xl text-sm font-body font-medium shop-btn-primary"
            >
              Proceed to Checkout
            </button>
            <p className="text-elovayne-dim/50 text-[10px] text-center">
              Secure payment via Stripe. Refunds available within 24 hours if file has not been downloaded.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Preview modal ─── */
function PreviewModal({
  product,
  onClose,
  onAddToBasket,
}: {
  product: ShopProduct;
  onClose: () => void;
  onAddToBasket: (p: ShopProduct) => void;
}) {
  const [audioPlaying, setAudioPlaying] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-elevated rounded-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-elovayne-dim hover:text-elovayne-light flex items-center justify-center transition-colors"
          aria-label="Close preview"
        >
          ✕
        </button>

        <div className="relative">
          <ShopProductImage category={product.category} name={product.name} size="lg" className="mx-auto" />
        </div>

        <div className="p-6 md:p-8">
          <span className="text-[10px] font-body uppercase tracking-[0.15em] text-elovayne-dim mb-2 block">
            {product.categoryLabel}
          </span>
          <h2 className="font-heading text-2xl md:text-3xl text-elovayne-light glow-text mb-3">{product.name}</h2>
          <p className="text-elovayne-muted text-sm leading-relaxed mb-6">{product.longDescription}</p>

          {product.includes && product.includes.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <h4 className="text-[10px] font-body uppercase tracking-wider text-elovayne-dim mb-3">What&apos;s Included</h4>
              <ul className="space-y-1.5">
                {product.includes.map((item, i) => (
                  <li key={i} className="text-elovayne-muted text-xs flex items-start gap-2">
                    <span className="text-elovayne-violet mt-0.5">◈</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.hasAudio && (
            <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <h4 className="text-[10px] font-body uppercase tracking-wider text-elovayne-dim mb-3">Audio Preview</h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAudioPlaying(!audioPlaying)}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-elovayne-violet/30 text-elovayne-violet hover:bg-elovayne-violet/10 transition-all duration-300"
                  aria-label={audioPlaying ? "Pause preview" : "Play preview"}
                >
                  {audioPlaying ? "❚❚" : "▶"}
                </button>
                <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-elovayne-violet/40"
                    initial={{ width: "0%" }}
                    animate={audioPlaying ? { width: "100%" } : { width: "0%" }}
                    transition={{ duration: 15, ease: "linear" }}
                  />
                </div>
                <span className="text-elovayne-dim text-[10px]">0:00 / 0:15</span>
              </div>
            </div>
          )}

          {product.category === "profiles" && (
            <div className="mb-6 p-6 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <h4 className="text-[10px] font-body uppercase tracking-wider text-elovayne-dim mb-3">Profile Preview</h4>
              <div className="relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(157,124,216,0.08), rgba(232,121,168,0.06))" }}>
                <div className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-elovayne-violet/10 border border-elovayne-violet/20 flex items-center justify-center">
                    <span className="text-elovayne-violet text-xl">◈</span>
                  </div>
                  <div>
                    <div className="w-24 h-3 rounded bg-elovayne-violet/15 mb-2" />
                    <div className="w-32 h-2 rounded bg-elovayne-violet/10" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <span className="text-elovayne-gold font-heading text-3xl">£{product.price.toFixed(2)}</span>
            <span className="text-elovayne-dim text-xs uppercase tracking-wider">Digital Download</span>
          </div>

          <button
            onClick={() => { onAddToBasket(product); onClose(); }}
            className="w-full py-3.5 rounded-xl text-sm font-body font-medium shop-btn-primary"
          >
            Add to Basket
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Gift form ─── */
function GiftForm() {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  return (
    <motion.div
      className="glass-elevated rounded-2xl p-6 md:p-8 max-w-lg mx-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionFade}
    >
      <h3 className="font-heading text-xl text-elovayne-light mb-4">Send a Gift</h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-body uppercase tracking-wider text-elovayne-dim block mb-1.5">
            Recipient Username or Email
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter username or email"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-elovayne-violet/10 text-elovayne-light text-sm font-body placeholder:text-elovayne-dim/40 focus:outline-none focus:border-elovayne-violet/30 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-body uppercase tracking-wider text-elovayne-dim block mb-1.5">
            Optional Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-elovayne-violet/10 text-elovayne-light text-sm font-body placeholder:text-elovayne-dim/40 focus:outline-none focus:border-elovayne-violet/30 transition-colors resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAnonymous(!anonymous)}
            className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${
              anonymous ? "bg-elovayne-violet/40" : "bg-white/[0.06]"
            } border border-elovayne-violet/20`}
            role="switch"
            aria-checked={anonymous}
            aria-label="Send anonymously"
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                anonymous ? "left-5 bg-elovayne-violet" : "left-0.5 bg-elovayne-dim"
              }`}
            />
          </button>
          <span className="text-elovayne-muted text-xs">Send anonymously</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN SHOP PAGE
   ═══════════════════════════════════════════════ */

export default function ShopPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [basket, setBasket] = useState<BasketItem[]>(() => loadBasket());
  const [showBasket, setShowBasket] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<ShopProduct | null>(null);
  const [supportAmount, setSupportAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const addToBasket = useCallback((product: ShopProduct) => {
    setBasket((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const next = existing
        ? prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...prev, { product, quantity: 1 }];
      saveBasket(next);
      return next;
    });
  }, []);

  const removeFromBasket = useCallback((id: string) => {
    setBasket((prev) => {
      const next = prev.filter((item) => item.product.id !== id);
      saveBasket(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setBasket((prev) => {
      const next = prev.map((item) => (item.product.id === id ? { ...item, quantity: qty } : item));
      saveBasket(next);
      return next;
    });
  }, []);

  const handleCheckout = useCallback(async () => {
    if (basket.length === 0) return;
    const origin = window.location.origin;
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: `price_product_${basket[0].product.id}`,
          successUrl: `${origin}/shop?success=true`,
          cancelUrl: `${origin}/shop`,
          mode: "payment",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Checkout is not configured yet. Please contact support.");
    }
  }, [basket]);

  const handleSupport = useCallback(async (amount: number) => {
    const origin = window.location.origin;
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: `price_support_${amount}`,
          successUrl: `${origin}/shop?success=true`,
          cancelUrl: `${origin}/shop`,
          mode: "payment",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Support payment is not configured yet.");
    }
  }, []);

  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  const showJournals = activeCategory === "all" || activeCategory === "journals";
  const showWallpapers = activeCategory === "all" || activeCategory === "wallpapers";
  const showSoundscapes = activeCategory === "all" || activeCategory === "soundscapes";
  const showProfiles = activeCategory === "all" || activeCategory === "profiles";
  const showFeatured = activeCategory === "all";
  const showMembership = activeCategory === "all" || activeCategory === "membership";
  const showGifts = activeCategory === "all" || activeCategory === "gifts";
  const showSupport = activeCategory === "all" || activeCategory === "support";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0, 255, 136, 0.03) 100%)",
          zIndex: 2,
        }}
      />
      <div className="global-corners" />
      <div className="global-corners-extra" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ── Basket button ── */}
        {basketCount > 0 && (
          <motion.button
            className="fixed top-6 right-6 z-40 w-12 h-12 rounded-full glass-elevated flex items-center justify-center group hover:border-elovayne-violet/30 transition-all duration-300"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setShowBasket(true)}
            aria-label={`Open basket, ${basketCount} items`}
          >
            <span className="text-elovayne-violet text-lg">◈</span>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-elovayne-violet text-white text-[10px] font-body font-medium flex items-center justify-center">
              {basketCount}
            </span>
          </motion.button>
        )}

        <div className="flex-1">
          {/* ═══════════════ HERO ═══════════════ */}
          <section className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-elovayne-violet/[0.04] blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-elovayne-cosmic-pink/[0.03] blur-[100px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-elovayne-gold/[0.015] blur-[150px]" />
            </div>
            <HeroParticles />

            <motion.div
              className="relative text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                className="text-4xl md:text-5xl mb-6"
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                ◈
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading glow-text-strong mb-6">
                The Elovayne Shop
              </h1>

              <p className="text-xl md:text-2xl font-heading text-elovayne-muted mb-4 italic">
                Take a piece of Elovayne with you.
              </p>

              <p className="text-elovayne-dim text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
                Discover digital journals, calming soundscapes, profile customisations and meaningful
                creations designed to bring comfort beyond the screen.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#collection"
                  className="px-8 py-3.5 rounded-xl text-sm font-body font-medium shop-btn-primary"
                >
                  Explore the Collection
                </a>
                <a
                  href="#support"
                  className="px-8 py-3.5 rounded-xl text-sm font-body font-medium border border-elovayne-violet/20 text-elovayne-muted hover:text-elovayne-light hover:border-elovayne-violet/40 transition-all duration-300"
                >
                  Support Elovayne
                </a>
              </div>

              <div className="flex items-center justify-center gap-3 mt-10">
                <span className="w-16 h-px bg-gradient-to-r from-transparent to-elovayne-violet/30" />
                <span className="text-elovayne-violet/40 text-[10px] tracking-[0.3em]">Digital Products</span>
                <span className="w-16 h-px bg-gradient-to-l from-transparent to-elovayne-violet/30" />
              </div>
            </motion.div>
          </section>

          {/* ═══════════════ CATEGORY FILTER ═══════════════ */}
          <section className="px-4 sm:px-6 py-4">
            <div className="max-w-5xl mx-auto">
              <CategoryBar active={activeCategory} onSelect={setActiveCategory} />
            </div>
          </section>

          {/* ═══════════════ FEATURED COLLECTION ═══════════════ */}
          {showFeatured && (
            <section id="collection" className="px-4 sm:px-6 py-12 sm:py-16">
              <div className="max-w-5xl mx-auto">
                <SectionHeader title="Featured in the Shop" />
                <div className="grid md:grid-cols-3 gap-6">
                  {FEATURED_PRODUCTS.map((product, i) => (
                    <FeaturedCard
                      key={product.id}
                      product={product}
                      index={i}
                      onPreview={setPreviewProduct}
                      onAddToBasket={addToBasket}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════ DIGITAL JOURNALS ═══════════════ */}
          {showJournals && (
            <section className="px-4 sm:px-6 py-12 sm:py-16">
              <div className="max-w-5xl mx-auto">
                <SectionHeader
                  title="Digital Journals"
                  subtitle="Guided spaces for reflection, healing and self-discovery"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {JOURNALS.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      onPreview={setPreviewProduct}
                      onAddToBasket={addToBasket}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════ WALLPAPERS & DIGITAL ART ═══════════════ */}
          {showWallpapers && (
            <section className="px-4 sm:px-6 py-12 sm:py-16">
              <div className="max-w-5xl mx-auto">
                <SectionHeader
                  title="Wallpapers & Digital Art"
                  subtitle="Ethereal visuals for your devices and sacred spaces"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {WALLPAPERS.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      onPreview={setPreviewProduct}
                      onAddToBasket={addToBasket}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════ SOUNDSCAPES ═══════════════ */}
          {showSoundscapes && (
            <section className="px-4 sm:px-6 py-12 sm:py-16">
              <div className="max-w-5xl mx-auto">
                <SectionHeader
                  title="Soundscapes"
                  subtitle="Atmospheric sound journeys for calm, focus and emotional expression"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SOUNDSCAPES.map((product, i) => (
                    <SoundscapeCard
                      key={product.id}
                      product={product}
                      index={i}
                      onPreview={setPreviewProduct}
                      onAddToBasket={addToBasket}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════ PROFILE THEMES ═══════════════ */}
          {showProfiles && (
            <section className="px-4 sm:px-6 py-12 sm:py-16">
              <div className="max-w-5xl mx-auto">
                <SectionHeader
                  title="Profile Themes & Customisation"
                  subtitle="Personalise your space with premium digital aesthetics"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PROFILE_THEMES.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      onPreview={setPreviewProduct}
                      onAddToBasket={addToBasket}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════ ELOVAYNE PLUS ═══════════════ */}
          {showMembership && (
            <section className="px-4 sm:px-6 py-16 sm:py-20">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  className="glass-elevated rounded-3xl overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionFade}
                >
                  <div className="relative p-6 sm:p-8 md:p-12">
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-elovayne-gold/[0.03] rounded-full blur-[100px]" />
                    </div>

                    <div className="relative text-center mb-10">
                      <div className="inline-block px-4 py-1.5 rounded-full bg-elovayne-gold/10 border border-elovayne-gold/20 mb-6">
                        <span className="text-[10px] font-body uppercase tracking-[0.2em] text-elovayne-gold">Premium Membership</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-heading glow-text-strong mb-4">
                        Enter Deeper Into Elovayne
                      </h2>
                      <p className="text-elovayne-muted text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Elovayne Plus unlocks a more personal and immersive experience while helping
                        support the future of the community.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      {/* Benefits */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-body uppercase tracking-wider text-elovayne-dim mb-4">What You Get</h4>
                        {MEMBERSHIP_PRODUCT.includes?.map((benefit, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-elovayne-gold text-xs mt-0.5">◈</span>
                            <span className="text-elovayne-muted text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="space-y-4">
                        <div
                          className="p-5 rounded-2xl border border-elovayne-violet/10 bg-white/[0.02] cursor-pointer transition-all duration-300 hover:border-elovayne-violet/25"
                          onClick={() => addToBasket({ ...MEMBERSHIP_PRODUCT, id: "elovayne-plus-monthly", price: 4.99, name: "Elovayne Plus Monthly" })}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-elovayne-light font-heading text-lg">Monthly</span>
                            <span className="text-elovayne-gold font-heading text-xl">£4.99</span>
                          </div>
                          <p className="text-elovayne-dim text-xs">Billed monthly. Cancel anytime.</p>
                        </div>

                        <div
                          className="p-5 rounded-2xl border border-elovayne-gold/30 bg-elovayne-gold/[0.03] cursor-pointer transition-all duration-300 hover:border-elovayne-gold/50 relative overflow-hidden"
                          onClick={() => addToBasket({ ...MEMBERSHIP_PRODUCT, id: "elovayne-plus-yearly", price: 39.99, name: "Elovayne Plus Yearly" })}
                        >
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-elovayne-gold/15 text-[9px] font-body uppercase tracking-wider text-elovayne-gold">
                            Best Value
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-elovayne-light font-heading text-lg">Yearly</span>
                            <span className="text-elovayne-gold font-heading text-xl">£39.99</span>
                          </div>
                          <p className="text-elovayne-dim text-xs">£3.33/month — save 33%</p>
                        </div>

                        <button
                          onClick={() => addToBasket(MEMBERSHIP_PRODUCT)}
                          className="w-full py-3.5 rounded-xl text-sm font-body font-medium shop-btn-primary mt-2"
                        >
                          Join Elovayne Plus
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>
          )}

          {/* ═══════════════ GIFT SANCTUARY ═══════════════ */}
          {showGifts && (
            <section className="px-4 sm:px-6 py-12 sm:py-16">
              <div className="max-w-5xl mx-auto">
                <SectionHeader
                  title="Gift Elovayne"
                  subtitle="Share Elovayne with someone who needs it"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {GIFT_OPTIONS.map((product, i) => (
                    <GiftCard
                      key={product.id}
                      product={product}
                      index={i}
                      onAddToBasket={addToBasket}
                    />
                  ))}
                </div>
                <GiftForm />
              </div>
            </section>
          )}

          {/* ═══════════════ SUPPORT ELOVAYNE ═══════════════ */}
          {showSupport && (
            <section id="support" className="px-4 sm:px-6 py-16 sm:py-20">
              <div className="max-w-3xl mx-auto">
                <motion.div
                  className="text-center mb-10"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionFade}
                >
                  <h2 className="text-2xl md:text-3xl font-heading glow-text-strong mb-3">
                    Help Keep Elovayne Alive
                  </h2>
                  <p className="text-elovayne-muted text-sm max-w-lg mx-auto leading-relaxed">
                    Your support helps Elovayne grow, remain safe and continue creating meaningful
                    spaces for people who need somewhere to feel understood.
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <span className="w-16 h-px bg-gradient-to-r from-transparent to-elovayne-violet/30" />
                    <span className="text-elovayne-violet/50 text-[10px] tracking-[0.3em] uppercase">♡</span>
                    <span className="w-16 h-px bg-gradient-to-l from-transparent to-elovayne-violet/30" />
                  </div>
                </motion.div>

                <motion.div
                  className="glass-elevated rounded-2xl p-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionFade}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {SUPPORT_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => { setSupportAmount(amount); setCustomAmount(""); }}
                        className={`py-3 rounded-xl text-sm font-body font-medium transition-all duration-300 ${
                          supportAmount === amount
                            ? "bg-elovayne-violet/20 border border-elovayne-violet/40 text-elovayne-light"
                            : "border border-elovayne-violet/10 text-elovayne-dim hover:border-elovayne-violet/25 hover:text-elovayne-muted"
                        }`}
                      >
                        £{amount}
                      </button>
                    ))}
                  </div>
                  <div className="mb-6">
                    <label className="text-[10px] font-body uppercase tracking-wider text-elovayne-dim block mb-1.5">
                      Or enter a custom amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-elovayne-dim text-sm">£</span>
                      <input
                        type="number"
                        min="1"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSupportAmount(null); }}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-elovayne-violet/10 text-elovayne-light text-sm font-body placeholder:text-elovayne-dim/40 focus:outline-none focus:border-elovayne-violet/30 transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const amt = supportAmount || parseInt(customAmount);
                      if (amt > 0) handleSupport(amt);
                    }}
                    className="w-full py-3.5 rounded-xl text-sm font-body font-medium shop-btn-primary"
                    disabled={!supportAmount && !customAmount}
                  >
                    {supportAmount ? `Support with £${supportAmount}` : customAmount ? `Support with £${customAmount}` : "Choose an amount"}
                  </button>
                  <p className="text-elovayne-dim/50 text-[10px] text-center mt-4">
                    No pressure. Every contribution, no matter the size, helps keep this space alive.
                  </p>
                </motion.div>
              </div>
            </section>
          )}

          {/* ═══════════════ TRUST & INFO ═══════════════ */}
          <section className="px-4 sm:px-6 py-12 sm:py-16">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionFade}
              >
                {TRUST_ITEMS.map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl mb-2 text-elovayne-violet">{item.icon}</div>
                    <p className="text-elovayne-dim text-[10px] leading-relaxed">{item.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-elovayne-dim"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionFade}
              >
                <Link href="/about" className="hover:text-elovayne-violet transition-colors">Refund Policy</Link>
                <span className="text-elovayne-violet/20">|</span>
                <Link href="/about#guidelines" className="hover:text-elovayne-violet transition-colors">Terms</Link>
                <span className="text-elovayne-violet/20">|</span>
                <Link href="/about#privacy" className="hover:text-elovayne-violet transition-colors">Digital Product Licence</Link>
                <span className="text-elovayne-violet/20">|</span>
                <Link href="/support" className="hover:text-elovayne-violet transition-colors">Contact Support</Link>
              </motion.div>
            </div>
          </section>

          {/* ═══════════════ FINAL MESSAGE ═══════════════ */}
          <section className="px-6 py-16">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionFade}
            >
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-elovayne-violet/30 to-transparent mx-auto mb-8" />
              <p className="text-elovayne-muted text-sm md:text-base leading-relaxed italic font-heading">
                &ldquo;Thank you for helping keep Elovayne alive. Every purchase supports the creation
                of a place where someone may feel understood for the first time.&rdquo;
              </p>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-elovayne-violet/30 to-transparent mx-auto mt-8" />
            </motion.div>
          </section>
        </div>
      </div>

      {/* ── Basket panel ── */}
      <AnimatePresence>
        {showBasket && (
          <BasketPanel
            items={basket}
            onRemove={removeFromBasket}
            onUpdateQuantity={updateQuantity}
            onCheckout={handleCheckout}
            onClose={() => setShowBasket(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Preview modal ── */}
      <AnimatePresence>
        {previewProduct && (
          <PreviewModal
            product={previewProduct}
            onClose={() => setPreviewProduct(null)}
            onAddToBasket={addToBasket}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
