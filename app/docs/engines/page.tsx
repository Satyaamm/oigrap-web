import Link from 'next/link';
import { CodeBlock } from '../../components/CodeBlock';

export default function EnginesOverviewPage() {
  const engines = [
    {
      name: 'Row store',
      href: '/docs/engines/row-store',
      bestFor: 'OLTP, transactional workloads',
      keyFeature: 'Slotted heap pages, B+ tree, 2PL, MVCC',
    },
    {
      name: 'Columnar OLAP',
      href: '/docs/engines/columnar',
      bestFor: 'Analytical aggregations',
      keyFeature: 'RLE/dictionary/delta encoding, zone maps, vectorized execution',
    },
    {
      name: 'Vector ANN',
      href: '/docs/engines/vector',
      bestFor: 'Embedding similarity search',
      keyFeature: 'HNSW graph index, L2 distance, recall > 0.80 at k=10',
    },
    {
      name: 'JSONB',
      href: '/docs/engines/jsonb',
      bestFor: 'Schema-flexible documents',
      keyFeature: '8-tag binary format, GIN posting-list index',
    },
    {
      name: 'Graph',
      href: '/docs/engines/graph',
      bestFor: 'Network traversal, ranking',
      keyFeature: 'oigrap_shortest_path, oigrap_pagerank, WITH RECURSIVE',
    },
    {
      name: 'Distributed',
      href: '/docs/engines/distributed',
      bestFor: 'Horizontal scale',
      keyFeature: 'RAFT consensus, range-sharding, two-phase commit',
    },
  ];

  return (
    <div className="text-[#f0f0f0]">
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / engines</p>
      <h1 className="text-4xl font-black mb-4 tracking-tight">Storage engines</h1>
      <p className="text-[#9ca3af] text-lg leading-relaxed mb-8">
        oigrap ships six storage engines, each optimized for a different access pattern, all unified under one SQL interface.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left py-3 pr-6 text-[#6b7280] font-semibold">Engine</th>
              <th className="text-left py-3 pr-6 text-[#6b7280] font-semibold">Best for</th>
              <th className="text-left py-3 text-[#6b7280] font-semibold">Key feature</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {engines.map((e) => (
              <tr key={e.name}>
                <td className="py-3 pr-6">
                  <Link href={e.href} className="font-semibold text-[#818cf8] hover:text-[#a5b4fc] transition-colors">
                    {e.name}
                  </Link>
                </td>
                <td className="py-3 pr-6 text-[#9ca3af]">{e.bestFor}</td>
                <td className="py-3 text-[#4b5563] text-xs font-mono">{e.keyFeature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4">Choosing an engine</h2>
      <p className="text-[#9ca3af] text-sm leading-relaxed mb-4">
        oigrap does not require you to pick one engine. All engines coexist in one process and one catalog.
        A single query can join a row-store table against a JSONB document table and order the results by a vector distance.
        The planner dispatches each sub-expression to the appropriate engine automatically.
      </p>
      <p className="text-[#9ca3af] text-sm leading-relaxed mb-8">
        The distinction between engines is primarily about the physical layout of data on disk and
        the access patterns each layout favors. If you have both transactional and analytical requirements,
        store transactional data in row-store tables and analytical fact tables in columnar tables,
        then join across them in a single SQL statement.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {engines.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="border border-[#1e1e1e] rounded-lg p-5 hover:border-[#2d2d2d] hover:bg-[#111] transition-all group"
          >
            <div className="font-semibold text-[#f0f0f0] mb-1 group-hover:text-[#818cf8] transition-colors">{e.name}</div>
            <div className="text-xs text-[#4b5563]">{e.keyFeature}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
