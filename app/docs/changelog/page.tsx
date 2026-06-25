import { Callout } from '../../components/Callout';

export default function ChangelogPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">Project / Changelog</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Changelog</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        All notable changes to oigrap are recorded here. The format follows{' '}
        <a href="https://keepachangelog.com" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors">
          Keep a Changelog
        </a>
        . Versions are tagged on the{' '}
        <code className="font-mono text-[#c4b5fd] bg-[#111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">main</code> branch.
      </p>

      {/* Unreleased */}
      <div className="relative pl-6 border-l border-[#1e1e1e]">
        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1e1e1e] border-2 border-[#374151]" />
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[#f0f0f0] mb-1">Unreleased</h2>
          <p className="text-xs font-mono text-[#374151] mb-4">HEAD on develop</p>
          <p className="text-[#4b5563] text-sm">No changes yet.</p>
        </div>

        {/* 0.1.0-alpha */}
        <div className="absolute -left-[5px] mt-0 w-2.5 h-2.5 rounded-full bg-[#818cf8]" style={{ top: '7.5rem' }} />
        <div className="mb-10 pt-2">
          <div className="flex items-baseline gap-3 mb-1 flex-wrap">
            <h2 className="text-lg font-bold text-[#f0f0f0]">0.1.0-alpha</h2>
            <span className="text-xs font-mono text-[#818cf8] border border-[#818cf8]/30 rounded px-2 py-0.5">
              initial release
            </span>
          </div>
          <p className="text-xs font-mono text-[#374151] mb-6">2026-06-25</p>

          <Callout type="note">
            This is the first public release. The storage format and wire protocol are mostly stable
            but may change before 1.0. Not recommended for production use without thorough testing.
          </Callout>

          <h3 className="text-sm font-semibold text-[#d1d5db] mt-8 mb-3 uppercase tracking-wider text-xs">Added</h3>
          <ul className="space-y-2.5 text-sm text-[#6b7280] list-none">
            {[
              'Row store engine — slotted 8 KB heap pages, buffer pool (LRU, configurable frame count), B+ tree secondary indexes, 2PL lock manager with DFS deadlock detection.',
              'Columnar OLAP engine — per-column RLE, dictionary, and delta encoding; zone-map pruning (ZONE_SIZE=1000); vectorized GROUP BY aggregation.',
              'Vector ANN engine — HNSW multi-layer graph index (M=16, M0=32, ef_construction=200, level_mult=1/ln(16)); beam search with select-neighbors heuristic; L2 distance; recall >0.80 at k=10 in CI.',
              'JSONB engine — 8-tag binary encoding (0x01–0x08); GIN posting-list index (BTreeMap<String, Vec<TupleId>>); operators: -> ->> @> ? || #>.',
              'Graph engine — oigrap_shortest_path() BFS with thread-local edge cache; oigrap_pagerank() 20-iteration power iteration (damping 0.85); WITH RECURSIVE CTEs with HashSet cycle detection; DEPTH() via Cell<i64>.',
              'Distributed layer — RAFT consensus (election timeout 150–300 ms, heartbeat 50 ms, log compaction + InstallSnapshot RPC); range-partitioned shard router with binary-search lookup; two-phase commit coordinator (TwoPhaseRaftCoordinator).',
              'Write-ahead log — 34-byte ARIES-style record header (LSN, prev_LSN, xid, rmgr_id, record_type, length, CRC32); 4 MB in-memory buffer with 2 MB auto-flush trigger; 6 record types (HEAP_INSERT, HEAP_UPDATE, HEAP_DELETE, XACT_COMMIT, XACT_ABORT, CHECKPOINT).',
              'MVCC — per-transaction snapshots (xmin, xmax, active Vec<Xid>); visibility check with committed/aborted/active sets; serializable snapshot isolation via rw-anti-dependency cycle detection on (table_id, page_id, slot_id) granularity.',
              'ARIES crash recovery — three-phase Analysis / Redo (page-LSN idempotency guard) / Undo (force_abort via prev_LSN chain).',
              'SQL parser — hand-written recursive-descent parser; no external parser generator dependency.',
              'Query planner — Selinger dynamic-programming join optimizer for n<=7 tables; greedy join ordering for n>7.',
              'Executor — hash join with spill-to-disk (FNV-1a partitioning, HASH_JOIN_SPILL_THRESHOLD=100,000 rows); window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM/AVG/MIN/MAX OVER); CTEs; subqueries.',
              'PostgreSQL wire protocol v3 — simple and extended query; trust and MD5 authentication; TLS via rustls with ephemeral self-signed certificate (rcgen); default port 7432.',
              'pg_catalog shim — 14 virtual tables including pg_type, pg_namespace, pg_class, pg_tables, pg_attribute, information_schema.tables, information_schema.columns; SET/SHOW statement handling; 20+ pg_catalog function stubs.',
              'Docker support — multi-stage Dockerfile (rust:1.78-slim build, debian:bookworm-slim runtime); docker-compose.yml with named volume and healthcheck.',
              '207 unit and integration tests across all crates; smoke, load, and edge-case test scripts.',
              'Website — Next.js 14, 18 documentation routes covering all engines, SQL reference, wire protocol, configuration, internals, and comparison page.',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-[#818cf8] shrink-0 font-mono text-xs mt-0.5">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
