export function Architecture() {
  const stats = [
    { n: '207', label: 'tests passing' },
    { n: '15k+', label: 'lines of Rust' },
    { n: '0', label: 'database deps' },
    { n: '80%+', label: 'HNSW recall' },
  ];

  return (
    <section className="px-8 py-24 max-w-5xl mx-auto border-t border-[#1a1a1a]">
      <p className="font-mono text-[#555] text-sm mb-12 uppercase tracking-widest">built from scratch</p>

      <p className="text-[#888] text-base leading-relaxed max-w-2xl mb-16">
        Every layer is hand-written — no embedded SQLite, no RocksDB, no existing database
        code. The storage engine starts at raw 8KB page I/O and builds up: disk manager,
        buffer pool, WAL, MVCC, B+ tree, SQL parser, optimizer, executor, and wire protocol.
        Distributed consensus is implemented from first principles via RAFT.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-3xl font-black text-white font-mono mb-1">{s.n}</div>
            <div className="text-[#555] text-sm font-mono">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
