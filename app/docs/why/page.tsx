import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';

export default function WhyOigrapPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / why oigrap</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Why oigrap is different</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        Most "multi-model" databases bolt different data models onto a single existing engine —
        usually a document store that added SQL, or a relational engine that added a vector plugin.
        oigrap is built the opposite way: six storage engines, one SQL surface, all sharing the
        same WAL and MVCC layer, written from scratch in Rust with zero database library dependencies.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-6">Capability matrix</h2>
      <div className="overflow-x-auto rounded-lg border border-[#1e1e1e]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-3 text-[#6b7280] font-semibold">Capability</th>
              <th className="text-center px-3 py-3 text-[#818cf8] font-semibold">oigrap</th>
              <th className="text-center px-3 py-3 text-[#6b7280] font-semibold">PostgreSQL</th>
              <th className="text-center px-3 py-3 text-[#6b7280] font-semibold">MongoDB</th>
              <th className="text-center px-3 py-3 text-[#6b7280] font-semibold">Pinecone</th>
              <th className="text-center px-3 py-3 text-[#6b7280] font-semibold">Neo4j</th>
              <th className="text-center px-3 py-3 text-[#6b7280] font-semibold">ClickHouse</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['Row store (OLTP)', 'yes', 'yes', 'no', 'no', 'no', 'partial'],
              ['Columnar OLAP', 'yes', 'no', 'no', 'no', 'no', 'yes'],
              ['Vector ANN (HNSW)', 'yes', 'pgvector ext', 'Atlas ext', 'yes', 'no', 'no'],
              ['JSONB / document', 'yes', 'yes', 'yes', 'no', 'no', 'partial'],
              ['Graph traversal', 'yes', 'no', 'no', 'no', 'yes', 'no'],
              ['WITH RECURSIVE + DEPTH()', 'yes', 'yes', 'no', 'no', 'Cypher', 'limited'],
              ['ACID (full SSI)', 'yes', 'yes', 'partial', 'no', 'no', 'eventual'],
              ['ARIES WAL recovery', 'yes', 'yes', 'journal', 'no', 'no', 'WAL'],
              ['MVCC', 'yes', 'yes', 'yes', 'no', 'no', 'yes'],
              ['RAFT consensus', 'yes', 'Patroni ext', 'yes', 'managed', 'Causal cluster', 'yes'],
              ['Two-phase commit', 'yes', 'yes', 'no', 'no', 'no', 'no'],
              ['PostgreSQL wire protocol', 'yes', 'yes', 'no', 'no', 'no', 'no'],
              ['Zero database dependencies', 'yes', 'no', 'no', 'no', 'no', 'no'],
              ['Written from scratch in Rust', 'yes', 'no', 'no', 'no', 'no', 'no'],
            ].map(([cap, ...vals]) => (
              <tr key={cap} className="bg-[#0f0f0f] hover:bg-[#111] transition-colors">
                <td className="px-4 py-2.5 text-[#9ca3af] text-xs">{cap}</td>
                {vals.map((v, i) => (
                  <td key={i} className={`px-3 py-2.5 text-center text-xs font-mono ${
                    i === 0 ? (v === 'yes' ? 'text-[#818cf8]' : 'text-[#4b5563]') : 'text-[#4b5563]'
                  }`}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">What no other single database has</h2>

      <div className="space-y-8 mt-6">

        <div className="border-l-2 border-[#818cf8] pl-6">
          <h3 className="text-base font-semibold text-[#f0f0f0] mb-2">One query across six data models</h3>
          <p className="text-[#6b7280] text-sm leading-relaxed mb-3">
            PostgreSQL needs pgvector, Apache AGE, and TimescaleDB to approximate what oigrap does natively.
            MongoDB added a vector index in Atlas but has no columnar engine or graph traversal.
            Pinecone is vector-only. Neo4j is graph-only. ClickHouse is columnar-only.
            oigrap executes a single SQL statement that joins row data, vectors, JSONB documents, and graph paths.
          </p>
          <CodeBlock lang="sql">{`-- Row join + vector ANN + JSONB + graph — one statement, one engine
SELECT
    u.name,
    p.metadata->>'title'   AS doc_title,
    oigrap_shortest_path(u.id, 99, 'follows', 'src', 'dst') AS hops_to_vip
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE p.tags @> '["premium"]'
ORDER BY u.embedding <-> '[0.1, 0.4, 0.9]'
LIMIT 10;`}</CodeBlock>
        </div>

        <div className="border-l-2 border-[#818cf8] pl-6">
          <h3 className="text-base font-semibold text-[#f0f0f0] mb-2">True ACID across all models</h3>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            All six engines share a single ARIES write-ahead log and MVCC layer. A transaction that
            writes row data, updates a JSONB document, and inserts into a vector table commits or
            aborts atomically. Serializable Snapshot Isolation detects rw-anti-dependency cycles
            across all tables regardless of storage format.
          </p>
        </div>

        <div className="border-l-2 border-[#818cf8] pl-6">
          <h3 className="text-base font-semibold text-[#f0f0f0] mb-2">Built entirely from scratch — no database dependencies</h3>
          <p className="text-[#6b7280] text-sm leading-relaxed mb-3">
            oigrap contains no embedded SQLite, RocksDB, LevelDB, or other database engine. The full
            stack — slotted heap pages, buffer pool, B+ tree, HNSW, GIN, WAL, MVCC, SQL parser,
            Pratt expression evaluator, Selinger DP planner, and RAFT — is hand-written Rust.
            The binary has no runtime dependency on any database library.
          </p>
          <div className="rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] p-4 font-mono text-xs space-y-1 text-[#6b7280]">
            <div className="text-[#f0f0f0] mb-2">What is zero-dependency actually means:</div>
            <div>- SQL parser: hand-written recursive-descent + Pratt</div>
            <div>- Storage: slotted 8KB heap pages, custom buffer pool</div>
            <div>- B+ tree: custom, integrated with WAL</div>
            <div>- HNSW: custom, ef_construction=200, M=16</div>
            <div>- GIN: custom posting-list index</div>
            <div>- WAL: ARIES redo+undo, hand-serialized log records</div>
            <div>- RAFT: hand-written from the paper</div>
          </div>
        </div>

        <div className="border-l-2 border-[#818cf8] pl-6">
          <h3 className="text-base font-semibold text-[#f0f0f0] mb-2">Selinger 1979 join optimizer</h3>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            oigrap implements the classic Selinger dynamic-programming join optimizer. For queries
            joining up to 7 tables, it enumerates all 2^n join orderings with a bitmask DP.
            For more than 7 tables it falls back to greedy ascending row-count ordering.
            Cross joins are always placed last. The cost model uses selectivity 0.1 for equi-joins
            and falls back to 1,000 rows when a table has no statistics.
          </p>
        </div>

        <div className="border-l-2 border-[#818cf8] pl-6">
          <h3 className="text-base font-semibold text-[#f0f0f0] mb-2">Spill-to-disk hash join</h3>
          <p className="text-[#6b7280] text-sm leading-relaxed mb-3">
            When the right-side row count exceeds 100,000 rows, oigrap automatically switches from
            an in-memory hash join to a partition-then-probe spill-to-disk strategy.
            Both sides are partitioned into k buckets using FNV-1a 64-bit hashing
            (offset basis 14695981039346656037, prime 1099511628211).
            k is clamped to [2, 256]. Each bucket is joined in memory independently.
            Spill files are cleaned up immediately after use via Rust&apos;s Drop trait.
          </p>
          <div className="rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] p-4 font-mono text-xs text-[#6b7280]">
            <div className="text-[#f0f0f0] mb-2">Spill wire format per row:</div>
            <div>[u32 col_count LE][per column: u8 tag + value bytes]</div>
            <div className="mt-2 text-[#4b5563]">Tags: 0=Null, 1=Bool(1B), 2=Int64(8B LE), 3=Float64(8B LE), 4=Text(u32 len LE + bytes)</div>
          </div>
        </div>

        <div className="border-l-2 border-[#818cf8] pl-6">
          <h3 className="text-base font-semibold text-[#f0f0f0] mb-2">PostgreSQL wire protocol — no new client needed</h3>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            oigrap speaks PostgreSQL Frontend/Backend Protocol v3 on port 7432. Any PostgreSQL client
            — psql, psycopg2, node-postgres, SQLAlchemy, Prisma, DBeaver, Metabase — connects without
            modification. The pg_catalog shim provides 14 virtual tables and 20+ catalog functions
            so that introspection queries from ORMs and GUI tools work out of the box.
          </p>
        </div>

        <div className="border-l-2 border-[#818cf8] pl-6">
          <h3 className="text-base font-semibold text-[#f0f0f0] mb-2">Graph analytics without a separate graph database</h3>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            oigrap&apos;s graph functions work on ordinary SQL tables. No Cypher. No property graph
            schema migration. Any table with integer edge columns is a graph.
            BFS shortest path and PageRank (20-iter, damping=0.85) are called as SQL functions and
            compose naturally with WHERE, JOIN, and ORDER BY. WITH RECURSIVE adds frontier BFS
            with cycle detection and the built-in DEPTH() function for depth-limited traversal.
          </p>
        </div>

      </div>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">What oigrap does not do (yet)</h2>
      <Callout type="note">
        oigrap is alpha software. Some capabilities present in production databases are not yet implemented.
      </Callout>
      <ul className="text-[#6b7280] text-sm leading-relaxed space-y-2 list-disc list-inside mt-4">
        <li>No ALTER TABLE, no schema migrations.</li>
        <li>No native VECTOR type — vectors are stored as TEXT in JSON array format.</li>
        <li>No SQL DDL for cluster management (ADD NODE, RESHARD).</li>
        <li>No cost-based selectivity estimation beyond the default 0.1 for equi-joins.</li>
        <li>No sub-queries in WHERE clauses (scalar sub-select in SELECT list works).</li>
        <li>No stored procedures or user-defined functions.</li>
        <li>Window functions support ROW_NUMBER, RANK, LAG, LEAD — SUM/AVG OVER window is not yet implemented.</li>
      </ul>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Use oigrap when</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {[
          {
            title: 'Your data is multi-model',
            desc: 'You store documents, vectors, and relational data and want to query them together without managing multiple databases and ETL pipelines.',
          },
          {
            title: 'You need ACID across models',
            desc: 'A transaction that writes a user record, updates a recommendation vector, and logs to a document store must commit atomically.',
          },
          {
            title: 'You are building AI applications',
            desc: 'Semantic search (vector ANN), document retrieval (JSONB), graph-based recommendations, and relational joins — all in one place.',
          },
          {
            title: 'You want to study database internals',
            desc: 'oigrap is a clean, from-scratch implementation of storage, indexing, query planning, concurrency control, and consensus — readable Rust, no legacy.',
          },
        ].map((card) => (
          <div key={card.title} className="border border-[#1e1e1e] rounded-lg p-5 bg-[#0f0f0f]">
            <div className="font-semibold text-[#f0f0f0] text-sm mb-2">{card.title}</div>
            <div className="text-[#6b7280] text-xs leading-relaxed">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
