import Link from 'next/link';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AnimatedTerminal } from './components/AnimatedTerminal';

function StatsBar() {
  const stats = [
    { n: '207', label: 'tests passing' },
    { n: '15,000+', label: 'lines of Rust' },
    { n: '0', label: 'database dependencies' },
    { n: '80%+', label: 'HNSW recall @ k=10' },
  ];
  return (
    <div className="border-y border-[#1e1e1e] bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1e1e1e]">
        {stats.map((s) => (
          <div key={s.label} className="px-6 first:pl-0 last:pr-0">
            <div className="text-2xl font-black text-[#f0f0f0] font-mono">{s.n}</div>
            <div className="text-xs text-[#4b5563] mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnginesSection() {
  const engines = [
    { name: 'Row store', href: '/docs/engines/row-store', desc: 'Slotted heap pages, buffer pool, B+ tree, 2PL deadlock detection.' },
    { name: 'Columnar OLAP', href: '/docs/engines/columnar', desc: 'RLE, dictionary, delta encoding. Zone-map pruning. Vectorized GROUP BY.' },
    { name: 'Vector ANN', href: '/docs/engines/vector', desc: 'HNSW multi-layer graph index. L2 distance. Recall > 0.80 at k=10.' },
    { name: 'JSONB', href: '/docs/engines/jsonb', desc: '8-tag binary encoding. GIN posting lists. Full operator set.' },
    { name: 'Graph', href: '/docs/engines/graph', desc: 'Shortest path, PageRank, WITH RECURSIVE CTEs, cycle detection.' },
    { name: 'ACID / SSI', href: '/docs', desc: 'ARIES WAL, MVCC, serializable snapshot isolation.' },
    { name: 'Distributed', href: '/docs/engines/distributed', desc: 'RAFT consensus, shard router, two-phase commit.' },
    { name: 'Wire protocol', href: '/docs/wire-protocol', desc: 'PostgreSQL v3 protocol. Any psql-compatible client on port 7432.' },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs font-mono text-[#4b5563] uppercase tracking-widest mb-3">Engines</p>
          <h2 className="text-3xl font-bold text-[#f0f0f0]">Six storage models. One SQL surface.</h2>
        </div>
        <Link href="/docs/engines" className="text-sm text-[#818cf8] hover:text-[#a5b4fc] transition-colors hidden sm:block">
          View all engines
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1e1e1e]">
        {engines.map((e) => (
          <Link
            key={e.name}
            href={e.href}
            className="bg-[#0d0d0d] hover:bg-[#111111] p-6 group transition-colors"
          >
            <div className="font-semibold text-[#f0f0f0] text-sm mb-2 group-hover:text-[#818cf8] transition-colors">{e.name}</div>
            <div className="text-[#4b5563] text-xs leading-relaxed">{e.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Connect',
      desc: 'Start oigrap on port 7432. Connect with any PostgreSQL client -- psql, psycopg2, node-postgres, SQLAlchemy, DBeaver. No driver install. No schema migration tool.',
      code: 'psql -h localhost -p 7432 -U postgres',
    },
    {
      num: '02',
      title: 'Query',
      desc: 'Write standard SQL. Use vector operators (<->) for similarity search, JSONB operators (->, @>) for documents, graph functions for traversal. All in one engine.',
      code: 'SELECT * FROM docs ORDER BY vec <-> $1 LIMIT 5;',
    },
    {
      num: '03',
      title: 'Scale',
      desc: 'Add nodes to the RAFT cluster. The shard router distributes range-partitioned data automatically. Two-phase commit keeps cross-shard transactions ACID.',
      code: 'oigrap --join 10.0.0.1:7432 --shard-id 2',
    },
  ];
  return (
    <section className="border-t border-[#1e1e1e] bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-xs font-mono text-[#4b5563] uppercase tracking-widest mb-12">How it works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((s) => (
            <div key={s.num}>
              <div className="font-mono text-4xl font-black text-[#1e1e1e] mb-4">{s.num}</div>
              <h3 className="text-lg font-semibold text-[#f0f0f0] mb-3">{s.title}</h3>
              <p className="text-[#4b5563] text-sm leading-relaxed mb-4">{s.desc}</p>
              <pre className="text-xs font-mono text-[#818cf8] bg-[#0d0d0d] border border-[#1e1e1e] rounded px-3 py-2 overflow-x-auto">{s.code}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-t border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl font-bold text-[#f0f0f0] mb-2">Ready to start building?</h2>
          <p className="text-[#4b5563] text-sm">Follow the quick start guide to have oigrap running in under 5 minutes.</p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Link
            href="/docs/quickstart"
            className="px-5 py-2.5 rounded-md bg-[#818cf8] hover:bg-[#a5b4fc] text-[#0d0d0d] font-semibold text-sm transition-colors"
          >
            Quick start
          </Link>
          <a
            href="https://github.com/Satyaamm/oigrap"
            className="px-5 py-2.5 rounded-md border border-[#1e1e1e] text-[#6b7280] hover:text-[#f0f0f0] hover:border-[#2d2d2d] text-sm transition-all"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#4b5563] border border-[#1e1e1e] rounded px-3 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
            alpha -- port 7432
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-[#f0f0f0] leading-[1.05] tracking-tight mb-6">
            The multi-model<br />database engine.
          </h1>
          <p className="text-[#6b7280] text-lg leading-relaxed mb-8 max-w-xl">
            oigrap is built from scratch in Rust. Row storage, columnar OLAP, vector ANN, JSONB,
            and graph -- unified under one SQL interface with full ACID guarantees and serializable isolation.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docs/quickstart"
              className="px-5 py-2.5 rounded-md bg-[#818cf8] hover:bg-[#a5b4fc] text-[#0d0d0d] font-semibold text-sm transition-colors"
            >
              Get started
            </Link>
            <Link
              href="/docs"
              className="px-5 py-2.5 rounded-md border border-[#1e1e1e] text-[#6b7280] hover:text-[#f0f0f0] hover:border-[#2d2d2d] text-sm transition-all"
            >
              Read the docs
            </Link>
          </div>
        </div>
        <div>
          <AnimatedTerminal />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <EnginesSection />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
