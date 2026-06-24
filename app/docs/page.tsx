import Link from 'next/link';
import { CodeBlock } from '../components/CodeBlock';
import { Callout } from '../components/Callout';

export default function DocsOverviewPage() {
  return (
    <div className="text-[#f0f0f0]">
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs</p>
      <h1 className="text-4xl font-black mb-4 tracking-tight">Overview</h1>
      <p className="text-[#9ca3af] text-lg leading-relaxed mb-8">
        oigrap is a multi-model database engine written from scratch in Rust, exposing a single SQL interface across six storage engines.
        Connect any PostgreSQL-compatible client to port 7432 and query row data, documents, vectors, and graphs in the same statement.
      </p>

      <Callout type="note">
        oigrap is alpha software. APIs and storage formats may change between versions.
      </Callout>

      <h2 className="text-2xl font-bold mt-12 mb-6">Architecture</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left py-3 pr-8 text-[#6b7280] font-semibold w-48">Layer</th>
              <th className="text-left py-3 text-[#6b7280] font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            <tr>
              <td className="py-3 pr-8 font-mono text-[#818cf8] text-xs">Wire protocol</td>
              <td className="py-3 text-[#9ca3af]">PostgreSQL Frontend/Backend Protocol v3, port 7432</td>
            </tr>
            <tr>
              <td className="py-3 pr-8 font-mono text-[#818cf8] text-xs">SQL engine</td>
              <td className="py-3 text-[#9ca3af]">Hand-written parser, planner, and executor. No external query engine dependencies.</td>
            </tr>
            <tr>
              <td className="py-3 pr-8 font-mono text-[#818cf8] text-xs">Storage engines</td>
              <td className="py-3 text-[#9ca3af]">Row store, columnar OLAP, vector ANN, JSONB, graph -- each plugged into the same catalog and WAL.</td>
            </tr>
            <tr>
              <td className="py-3 pr-8 font-mono text-[#818cf8] text-xs">WAL</td>
              <td className="py-3 text-[#9ca3af]">ARIES-style write-ahead log. Ensures durability and crash recovery across all engines.</td>
            </tr>
            <tr>
              <td className="py-3 pr-8 font-mono text-[#818cf8] text-xs">MVCC</td>
              <td className="py-3 text-[#9ca3af]">Multi-version concurrency control. Serializable snapshot isolation via conflict detection.</td>
            </tr>
            <tr>
              <td className="py-3 pr-8 font-mono text-[#818cf8] text-xs">Distributed</td>
              <td className="py-3 text-[#9ca3af]">RAFT consensus, range-partitioned shard router, two-phase commit.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">Quick links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { href: '/docs/quickstart', title: 'Quick start', desc: 'Have oigrap running in under 5 minutes.' },
          { href: '/docs/sql', title: 'SQL reference', desc: 'DDL, DML, joins, CTEs, window functions, operators.' },
          { href: '/docs/engines', title: 'Engines', desc: 'Row store, columnar, vector, JSONB, graph, distributed.' },
          { href: '/docs/wire-protocol', title: 'Wire protocol', desc: 'Connect psql, psycopg2, node-postgres, and other clients.' },
          { href: '/docs/configuration', title: 'Configuration', desc: 'Command-line flags and environment variables.' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-[#1e1e1e] rounded-lg p-5 hover:border-[#2d2d2d] hover:bg-[#111] transition-all group"
          >
            <div className="font-semibold text-[#f0f0f0] mb-1 group-hover:text-[#818cf8] transition-colors">{card.title}</div>
            <div className="text-sm text-[#4b5563]">{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
