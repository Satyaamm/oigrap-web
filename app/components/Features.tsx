export function Features() {
  const features = [
    {
      name: 'Row store',
      desc: 'Slotted 8KB heap pages. Buffer pool with LRU eviction. B+ tree indexes. 2PL lock manager with deadlock detection via BFS.',
    },
    {
      name: 'Columnar OLAP',
      desc: 'RLE, dictionary, and delta encoding. Zone-map pruning skips entire chunks. Vectorized GROUP BY without materializing full rows.',
    },
    {
      name: 'Vector ANN',
      desc: 'HNSW multi-layer graph index. Greedy beam search with select-neighbors heuristic. L2 distance. Recall > 0.80 at k=10.',
    },
    {
      name: 'JSONB',
      desc: '8-tag binary encoding. GIN index with posting lists. Operators: -> ->> @> ? || #>. Merge and path navigation built in.',
    },
    {
      name: 'Graph',
      desc: 'oigrap_shortest_path() for BFS length. oigrap_pagerank() via 20-iteration power iteration. WITH RECURSIVE CTEs with cycle detection.',
    },
    {
      name: 'ACID / SSI',
      desc: 'ARIES WAL with full redo and undo recovery. MVCC snapshot isolation. Serializable snapshot isolation with rw-anti-dependency cycle detection.',
    },
    {
      name: 'Distributed',
      desc: 'RAFT consensus with log compaction and InstallSnapshot RPC. Range-partitioned shard router. Two-phase commit coordinator.',
    },
    {
      name: 'Wire protocol',
      desc: 'PostgreSQL Frontend/Backend Protocol v3. Simple + extended query. Trust and MD5 auth. TLS via rustls. Any psql-compatible client connects.',
    },
  ];

  return (
    <section id="engines" className="px-8 py-24 max-w-5xl mx-auto">
      <p className="font-mono text-[#555] text-sm mb-12 uppercase tracking-widest">engines</p>
      <div className="divide-y divide-[#1a1a1a]">
        {features.map((f) => (
          <div key={f.name} className="py-6 grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-3 sm:gap-8">
            <span className="font-mono text-white text-sm font-semibold">{f.name}</span>
            <span className="text-[#666] text-sm leading-relaxed">{f.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
