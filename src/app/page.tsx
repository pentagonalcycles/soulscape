import Link from "next/link";
import CrochetWorldLogo from "@/components/CrochetWorldLogo";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-8">
        <CrochetWorldLogo />

        <p className="text-base md:text-lg max-w-md leading-relaxed text-crochetworld-muted">
          Make something, one stitch at a time.
        </p>

        <Link
          href="/threads"
          className="btn-primary px-8 py-3 rounded-full text-sm tracking-wider"
        >
          Enter Threads
        </Link>
      </div>
    </main>
  );
}