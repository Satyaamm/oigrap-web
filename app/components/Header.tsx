import Link from 'next/link';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo size={24} />
          <span className="font-bold text-[#f0f0f0] text-sm tracking-tight">oigrap</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#6b7280]">
          <Link href="/docs" className="hover:text-[#f0f0f0] transition-colors">Docs</Link>
          <Link href="/docs/engines" className="hover:text-[#f0f0f0] transition-colors">Engines</Link>
          <Link href="/docs/quickstart" className="hover:text-[#f0f0f0] transition-colors">Quick start</Link>
          <Link href="/docs/sql" className="hover:text-[#f0f0f0] transition-colors">SQL reference</Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href="https://github.com/Satyaamm/oigrap"
            className="text-sm text-[#6b7280] hover:text-[#f0f0f0] transition-colors hidden sm:block"
          >
            GitHub
          </a>
          <Link
            href="/docs/quickstart"
            className="text-sm px-3.5 py-1.5 rounded-md bg-[#818cf8] hover:bg-[#a5b4fc] text-[#0d0d0d] font-semibold transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
