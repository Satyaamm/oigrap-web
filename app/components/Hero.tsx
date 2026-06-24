'use client';
import { AnimatedTerminal } from './AnimatedTerminal';

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-8 pt-12 pb-24 max-w-5xl mx-auto">
      {/* Giant wordmark */}
      <div
        className="font-black text-white leading-none tracking-tighter mb-6 select-none"
        style={{ fontSize: 'clamp(72px, 14vw, 160px)' }}
      >
        oigrap
      </div>

      {/* One-line description */}
      <p className="text-[#888] text-xl font-mono mb-2 max-w-2xl leading-relaxed">
        A multi-model database built from scratch in Rust.
      </p>
      <p className="text-[#555] text-base font-mono mb-14 max-w-2xl leading-relaxed">
        Row store, columnar OLAP, vector ANN, JSONB, graph — unified under one SQL surface.
        Full ACID. Serializable isolation. Port 7432.
      </p>

      {/* Links */}
      <div className="flex items-center gap-8 mb-16 font-mono text-sm">
        <a href="/docs" className="text-[#a5b4fc] hover:text-white transition-colors underline underline-offset-4">
          read the docs
        </a>
        <a href="https://github.com/Satyaamm/oigrap" className="text-[#888] hover:text-white transition-colors">
          view on github
        </a>
        <span className="text-[#444] font-mono text-xs">alpha</span>
      </div>

      {/* Code terminal — the main visual */}
      <AnimatedTerminal />
    </section>
  );
}
