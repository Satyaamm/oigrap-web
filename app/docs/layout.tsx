import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const NAV = [
  {
    section: 'Getting started',
    links: [
      { href: '/docs', label: 'Overview' },
      { href: '/docs/quickstart', label: 'Quick start' },
      { href: '/docs/why', label: 'Why oigrap' },
      { href: '/docs/wire-protocol', label: 'Connecting clients' },
      { href: '/docs/configuration', label: 'Configuration' },
    ],
  },
  {
    section: 'SQL',
    links: [
      { href: '/docs/sql', label: 'SQL reference' },
    ],
  },
  {
    section: 'Engines',
    links: [
      { href: '/docs/engines', label: 'Overview' },
      { href: '/docs/engines/row-store', label: 'Row store' },
      { href: '/docs/engines/columnar', label: 'Columnar OLAP' },
      { href: '/docs/engines/vector', label: 'Vector ANN' },
      { href: '/docs/engines/graph', label: 'Graph' },
      { href: '/docs/engines/jsonb', label: 'JSONB' },
      { href: '/docs/engines/distributed', label: 'Distributed' },
    ],
  },
  {
    section: 'Internals',
    links: [
      { href: '/docs/internals', label: 'WAL, MVCC & ARIES' },
    ],
  },
  {
    section: 'Project',
    links: [
      { href: '/docs/changelog', label: 'Changelog' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header />
      <div className="max-w-7xl mx-auto px-6 flex gap-0">
        <aside className="hidden lg:block w-56 shrink-0 py-10 pr-8 border-r border-[#1e1e1e] sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto">
          {NAV.map((group) => (
            <div key={group.section} className="mb-8">
              <p className="text-[10px] font-semibold text-[#374151] uppercase tracking-widest mb-3 px-3">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block text-sm text-[#6b7280] hover:text-[#f0f0f0] hover:bg-[#111111] rounded-md px-3 py-1.5 transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main className="flex-1 min-w-0 py-10 lg:pl-12 max-w-3xl">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
