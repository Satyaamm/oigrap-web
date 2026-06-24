import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-[#1e1e1e] bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Logo size={20} />
            <span className="font-bold text-[#f0f0f0] text-sm">oigrap</span>
          </div>
          <p className="text-[#4b5563] text-sm leading-relaxed">
            A multi-model database engine built from scratch in Rust. Alpha.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#374151] uppercase tracking-widest mb-4">Docs</p>
          <ul className="space-y-2.5 text-sm text-[#6b7280]">
            <li><Link href="/docs/quickstart" className="hover:text-[#f0f0f0] transition-colors">Quick start</Link></li>
            <li><Link href="/docs/sql" className="hover:text-[#f0f0f0] transition-colors">SQL reference</Link></li>
            <li><Link href="/docs/wire-protocol" className="hover:text-[#f0f0f0] transition-colors">Wire protocol</Link></li>
            <li><Link href="/docs/configuration" className="hover:text-[#f0f0f0] transition-colors">Configuration</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#374151] uppercase tracking-widest mb-4">Engines</p>
          <ul className="space-y-2.5 text-sm text-[#6b7280]">
            <li><Link href="/docs/engines/row-store" className="hover:text-[#f0f0f0] transition-colors">Row store</Link></li>
            <li><Link href="/docs/engines/columnar" className="hover:text-[#f0f0f0] transition-colors">Columnar OLAP</Link></li>
            <li><Link href="/docs/engines/vector" className="hover:text-[#f0f0f0] transition-colors">Vector ANN</Link></li>
            <li><Link href="/docs/engines/graph" className="hover:text-[#f0f0f0] transition-colors">Graph</Link></li>
            <li><Link href="/docs/engines/jsonb" className="hover:text-[#f0f0f0] transition-colors">JSONB</Link></li>
            <li><Link href="/docs/engines/distributed" className="hover:text-[#f0f0f0] transition-colors">Distributed</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#374151] uppercase tracking-widest mb-4">Community</p>
          <ul className="space-y-2.5 text-sm text-[#6b7280]">
            <li><a href="https://github.com/Satyaamm/oigrap" className="hover:text-[#f0f0f0] transition-colors">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#1e1e1e] px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-[#374151] text-xs font-mono">oigrap alpha -- port 7432</span>
        <span className="text-[#374151] text-xs">Built from scratch in Rust</span>
      </div>
    </footer>
  );
}
