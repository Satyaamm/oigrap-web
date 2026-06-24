import { CodeBlock } from '../../../components/CodeBlock';
import { Callout } from '../../../components/Callout';

export default function ColumnarPage() {
  return (
    <div className="text-[#f0f0f0]">
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / engines / columnar</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Columnar OLAP</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        The columnar engine stores data in column-major format with three built-in compression schemes,
        zone-map predicate pushdown, and a vectorized execution path for aggregate queries. It shares the
        WAL and catalog with the row store — both engines coexist in the same database instance.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Compression schemes</h2>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Run-length encoding (RleColumn)</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">RleColumn</code> stores
        consecutive identical values as a single <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">(Value, u32)</code> run.
        Appending is O(1) when the last run matches. A column of 1,000,000 rows with only two distinct values
        (e.g. a boolean flag) requires exactly 2 run pairs. Scan is O(runs), not O(rows). Point lookup walks
        the run list accumulating counts.
      </p>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Dictionary encoding (DictColumn)</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">DictColumn</code> maintains
        a <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">Vec&lt;Value&gt;</code> dictionary
        and a <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">Vec&lt;u32&gt;</code> code array.
        Each distinct value is assigned one u32 code; new values are appended on first occurrence.
        Compression ratio is <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">row_count / dict_size</code>.
        For 200 distinct country codes across 10 million rows the ratio is 50,000×.
      </p>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Delta encoding (DeltaColumn)</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">DeltaColumn</code> stores
        the first value raw as <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">i64</code> and
        subsequent values as <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">i32</code> deltas.
        For a monotonically increasing sequence with unit steps, 1,000 rows consume
        8 + 999×4 = 4,004 bytes instead of 8,000 — a 2× ratio. The exact formula is:
      </p>
      <CodeBlock lang="text">{`compression_ratio = (n × 8) / (8 + (n−1) × 4)`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Zone maps</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Each column is divided into zones of <strong className="text-[#d1d5db]">ZONE_SIZE = 1,000 rows</strong>.
        Each zone stores a <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">ZoneMap</code> with
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> row_offset</code>,
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> row_count</code>,
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> min</code>, and
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> max</code>.
        Zone maps are rebuilt every ZONE_SIZE rows via <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">build_zone_maps()</code>.
      </p>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Before materializing data, the vectorized path calls <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">prune_with_zone_maps()</code>.
        Pruning decisions per operator:
      </p>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Predicate</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Zone skipped when</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['col > k', 'zone.max <= k'],
              ['col < k', 'zone.min >= k'],
              ['col >= k', 'zone.max < k (strict)'],
              ['col <= k', 'zone.min > k (strict)'],
              ['col = k', 'k < zone.min OR k > zone.max'],
            ].map(([p, c]) => (
              <tr key={p} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{p}</td>
                <td className="px-4 py-2 text-[#6b7280] text-xs">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[#6b7280] text-sm leading-relaxed">
        Only surviving zones are materialized into the <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">ColumnBatch</code>.
        For a 3,000-row table with column x = 0..2999 and predicate <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">WHERE x &gt; 2500</code>,
        zones 0 and 1 (max=999, max=1999) are pruned — only zone 2 is read.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Vectorized execution</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        When the executor detects a table with a columnar store and a simple aggregate query, it calls
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> vectorized_aggregate()</code>
        instead of the row-at-a-time path. The execution pipeline:
      </p>
      <ol className="text-[#6b7280] text-sm leading-relaxed space-y-2 list-decimal list-inside mb-4">
        <li>Prune zones via zone maps.</li>
        <li>Build a <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">ColumnBatch</code> (struct of arrays: <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">columns[col_idx][row_idx]</code>) from surviving zones.</li>
        <li>Apply the WHERE filter via <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">eval_filter()</code> — evaluates binary comparisons column-at-a-time, returning a boolean mask.</li>
        <li>Call <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">batch.filter(&mask)</code> to compact only qualifying rows.</li>
        <li>For ungrouped aggregates: <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">aggregate_column()</code> — single tight loop over a <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">Vec&lt;Value&gt;</code>.</li>
        <li>For GROUP BY: partition rows by serialized key string, build a mini-batch per group, aggregate each independently.</li>
      </ol>
      <p className="text-[#6b7280] text-sm leading-relaxed">
        Aggregate functions supported on the vectorized path: COUNT, SUM, AVG, MIN, MAX.
        The column-major layout means aggregates access one contiguous slice — cache-friendly with no
        row-struct indirection.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Persistence format</h2>
      <CodeBlock lang="text">{`[4 bytes]  magic "COL\\0"
[1 byte]   version = 1
[4 bytes]  column_count (u32 LE)
[8 bytes]  row_count (u64 LE)
per column:
  [4 bytes]  name_len (u32 LE)
  [N bytes]  name (UTF-8)
  [4 bytes]  run_count (u32 LE)
  per run:
    [1 byte]   type tag:
               0x00 = Null
               0x01 = Int64   → +8 bytes LE
               0x02 = Float64 → +8 bytes LE
               0x03 = Text    → +4 bytes len + N bytes UTF-8
               0x04 = Bool    → +1 byte (0 or 1)
    [4 bytes]  run_length (u32 LE)`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">SQL example</h2>
      <CodeBlock lang="sql">{`CREATE TABLE sales (
    id      INTEGER,
    region  TEXT,
    product TEXT,
    revenue FLOAT,
    month   TEXT
);

INSERT INTO sales VALUES (1, 'APAC', 'Widget', 1200.00, '2024-01');
INSERT INTO sales VALUES (2, 'EMEA', 'Gadget', 3400.00, '2024-01');
INSERT INTO sales VALUES (3, 'APAC', 'Gadget',  870.00, '2024-02');

-- Vectorized GROUP BY with zone-map pruning on month
SELECT   region, SUM(revenue) AS total, COUNT(*) AS orders
FROM     sales
WHERE    month >= '2024-01'
GROUP BY region
ORDER BY total DESC;`}</CodeBlock>

      <Callout type="note">
        The vectorized path falls back to the row-at-a-time executor for subqueries, correlated
        predicates, or unsupported aggregate functions. Large-cardinality GROUP BY keys are handled
        row-at-a-time.
      </Callout>
    </div>
  );
}
