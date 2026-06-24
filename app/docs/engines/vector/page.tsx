import { CodeBlock } from '../../../components/CodeBlock';
import { Callout } from '../../../components/Callout';

export default function VectorPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / engines / vector</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Vector ANN</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        oigrap implements approximate nearest-neighbor (ANN) search via a Hierarchical Navigable
        Small World (HNSW) graph index built from scratch in Rust — no external ANN library.
        Recall exceeds 0.80 at k=10 verified by an automated test over 1,000 16-dimensional vectors.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Index structure</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        The <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">HnswIndex</code> holds
        a flat <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">Vec&lt;HnswNode&gt;</code>.
        Each <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">HnswNode</code> stores
        the embedding vector (<code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">Vec&lt;f64&gt;</code>),
        the external row TID (<code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">u64</code>),
        and per-layer adjacency lists (<code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">Vec&lt;Vec&lt;usize&gt;&gt;</code>).
        Layer 0 holds all vectors; higher layers are sparser long-range skip layers.
      </p>

      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Parameter</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Default</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['M', '16', 'Max connections per node per layer 1+'],
              ['M0', '32 (= 2 × M)', 'Max connections at layer 0 (denser base layer)'],
              ['ef_construction', '200', 'Beam width during index construction'],
              ['level_mult', '1 / ln(16) ≈ 0.361', 'Controls geometric layer assignment distribution'],
              ['Max layer', '16', 'Hard cap on graph depth'],
              ['Distance', 'L2 Euclidean', 'sqrt(Σ (a[i] − b[i])²)'],
            ].map(([f, v, n]) => (
              <tr key={f} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{f}</td>
                <td className="px-4 py-2 font-mono text-[#f0f0f0] text-xs">{v}</td>
                <td className="px-4 py-2 text-[#6b7280] text-xs">{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Level assignment</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Each inserted node gets a randomly assigned maximum layer from <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">random_level()</code>.
        The implementation uses a PCG-style linear congruential generator seeded from the node count, producing
        reproducible level assignments. The geometric distribution is approximated by repeatedly comparing
        an LCG-derived float against <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">level_mult</code>:
      </p>
      <CodeBlock lang="rust">{`let mut x = n.wrapping_mul(6364136223846793005)
             .wrapping_add(1442695040888963407);
while level < 16 {
    x = x.wrapping_mul(6364136223846793005)
         .wrapping_add(1442695040888963407);
    let r = (x >> 33) as f64 / u32::MAX as f64;
    if r > self.level_mult { break; }
    level += 1;
}`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Insertion algorithm</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Both insertion phases use <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">search_layer()</code>,
        which maintains two heaps: a <strong className="text-[#d1d5db]">min-heap of candidates</strong>
        (<code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">MinEntry</code>, nearest first) and a
        <strong className="text-[#d1d5db]"> max-heap result set</strong> of size ef
        (<code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">HeapEntry</code>, farthest at top).
        Expansion stops when the nearest unvisited candidate is farther than the farthest element in the result.
      </p>
      <ol className="text-[#6b7280] text-sm leading-relaxed space-y-3 list-decimal list-inside mb-4">
        <li>
          <strong className="text-[#d1d5db]">Phase 1 — greedy descent:</strong> from the global entry point down to
          <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> node_level + 1</code>,
          call <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">search_layer(ef=1)</code> and take the single nearest result as entry point for the next layer.
        </li>
        <li>
          <strong className="text-[#d1d5db]">Phase 2 — insert with ef_construction:</strong> from
          <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> min(node_level, max_layer)</code> down to 0,
          call <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">search_layer(ef=ef_construction)</code>,
          take top-M nearest as neighbors, and add bidirectional edges.
        </li>
        <li>
          <strong className="text-[#d1d5db]">Pruning with back-edge preservation:</strong> after adding the back-edge from neighbor to the new node,
          if the neighbor now exceeds M connections, the adjacency list is sorted by distance and trimmed —
          but the back-edge to the newly inserted node is always kept, even if it is the farthest, ensuring
          the new node remains reachable from that neighbor for future graph traversals.
        </li>
      </ol>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Search algorithm</h2>
      <ol className="text-[#6b7280] text-sm leading-relaxed space-y-2 list-decimal list-inside mb-4">
        <li>Start at the global entry point.</li>
        <li>Layers 2+: <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">search_layer(ef=1)</code> — single greedy step per layer to descend quickly.</li>
        <li>Layer 1: <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">search_layer(ef=ef_search)</code> — wider beam to seed layer 0 well.</li>
        <li>Layer 0: <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">search_layer(ef=max(ef_search, k))</code> — full beam search; return top-k results.</li>
      </ol>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Persistence format</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Custom hand-written binary format — no serde, no external codec:
      </p>
      <CodeBlock lang="text">{`[4 bytes]  magic "HNSW"
[1 byte]   version = 1
[4 bytes]  M (u32 LE)
[4 bytes]  M0 (u32 LE)
[4 bytes]  ef_construction (u32 LE)
[4 bytes]  max_layer (u32 LE)
[8 bytes]  entry_point (i64 LE; -1 = empty)
[4 bytes]  node_count (u32 LE)
per node:
  [8 bytes]  external id (u64 LE)
  [4 bytes]  dimension (u32 LE)
  [dim×8]    vector components (f64 LE each)
  [4 bytes]  layer_count (u32 LE)
  per layer:
    [4 bytes]  neighbor_count (u32 LE)
    [n×4]      neighbor indices (u32 LE each)`}</CodeBlock>
      <p className="text-[#6b7280] text-sm leading-relaxed mt-4">
        On restart the index loads from disk directly — no rebuild step.
        Round-trip correctness is verified by <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">test_hnsw_persistence</code>:
        top-1 query result must be identical before and after save/load.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Recall guarantee</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">test_ann_recall_1k_vectors</code>
        runs in CI: 1,000 uniformly random 16-dimensional vectors, M=16, ef_construction=200,
        10 query vectors, k=10, ef_search=50. Average recall at k=10 must be &ge; 0.80.
        An extended <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">#[ignore]</code> test
        covers 100,000 32-dimensional vectors with ef_search=100, 20 queries, and the same 0.80 floor.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">SQL usage</h2>
      <CodeBlock lang="sql">{`-- Create table with an embedding column (stored as JSON array text)
CREATE TABLE embeddings (
    id    INTEGER,
    title TEXT,
    vec   TEXT
);

-- Build HNSW index
CREATE VECTOR INDEX ON embeddings (vec) USING hnsw;

-- Insert vectors
INSERT INTO embeddings VALUES (1, 'Intro to databases',   '[0.1, 0.4, 0.9, 0.2]');
INSERT INTO embeddings VALUES (2, 'Query optimisation',   '[0.8, 0.1, 0.3, 0.7]');
INSERT INTO embeddings VALUES (3, 'Distributed systems',  '[0.2, 0.6, 0.1, 0.5]');

-- ANN search: 5 nearest neighbours by L2 distance
SELECT id, title
FROM   embeddings
ORDER BY vec <-> '[0.1, 0.5, 0.8, 0.2]'
LIMIT 5;

-- Hybrid: nearest-neighbor + row-store join
SELECT e.title, d.summary
FROM   embeddings e
JOIN   documents  d ON e.id = d.embed_id
ORDER BY e.vec <-> '[0.1, 0.5, 0.8, 0.2]'
LIMIT 5;`}</CodeBlock>

      <Callout type="note">
        Vectors are stored as JSON text arrays (e.g. <code className="font-mono text-xs">&apos;[0.1, 0.4, 0.9]&apos;</code>).
        All dimensions within a column must be consistent. Cosine similarity can be approximated
        by normalizing vectors to unit length before insertion — L2 and cosine distances are
        monotonically related on the unit sphere.
      </Callout>
    </div>
  );
}
