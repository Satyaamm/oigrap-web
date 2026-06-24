import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';

export default function SqlPage() {
  return (
    <div className="text-[#f0f0f0]">
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / sql</p>
      <h1 className="text-4xl font-black mb-4 tracking-tight">SQL reference</h1>
      <p className="text-[#9ca3af] text-lg leading-relaxed mb-8">
        oigrap supports a substantial subset of standard SQL. This page covers DDL, DML, queries, joins, CTEs, window functions, transactions, operators, and data types.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">DDL</h2>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">CREATE TABLE</h3>
      <CodeBlock lang="sql">{`CREATE TABLE table_name (
    column_name data_type,
    ...
);`}</CodeBlock>
      <CodeBlock lang="sql">{`CREATE TABLE orders (
    id      INTEGER,
    user_id INTEGER,
    total   FLOAT,
    status  TEXT
);`}</CodeBlock>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">DROP TABLE</h3>
      <CodeBlock lang="sql">DROP TABLE table_name;</CodeBlock>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">CREATE INDEX (B+ tree)</h3>
      <CodeBlock lang="sql">{`CREATE INDEX index_name ON table_name (column_name);`}</CodeBlock>
      <CodeBlock lang="sql">{`CREATE INDEX idx_orders_user ON orders (user_id);`}</CodeBlock>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">CREATE VECTOR INDEX</h3>
      <CodeBlock lang="sql">{`CREATE VECTOR INDEX index_name ON table_name (column_name) USING hnsw;`}</CodeBlock>
      <CodeBlock lang="sql">{`CREATE VECTOR INDEX idx_docs_emb ON docs (embedding) USING hnsw;`}</CodeBlock>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">CREATE GIN INDEX</h3>
      <CodeBlock lang="sql">{`CREATE INDEX index_name ON table_name USING gin (column_name);`}</CodeBlock>
      <CodeBlock lang="sql">{`CREATE INDEX idx_records_payload ON records USING gin (payload);`}</CodeBlock>

      <h2 className="text-2xl font-bold mt-12 mb-6">DML</h2>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">INSERT</h3>
      <CodeBlock lang="sql">{`INSERT INTO table_name (col1, col2) VALUES (val1, val2);
INSERT INTO table_name VALUES (val1, val2, val3);`}</CodeBlock>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">UPDATE</h3>
      <CodeBlock lang="sql">{`UPDATE orders SET status = 'shipped' WHERE id = 42;`}</CodeBlock>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">DELETE</h3>
      <CodeBlock lang="sql">{`DELETE FROM orders WHERE status = 'cancelled';`}</CodeBlock>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">VACUUM</h3>
      <p className="text-[#9ca3af] text-sm leading-relaxed mb-3">
        Removes dead MVCC versions from the heap, reclaiming space from deleted and updated rows.
      </p>
      <CodeBlock lang="sql">VACUUM orders;</CodeBlock>

      <h2 className="text-2xl font-bold mt-12 mb-6">Queries</h2>
      <CodeBlock lang="sql">{`SELECT col1, col2
FROM table_name
WHERE col1 = 'value'
GROUP BY col2
ORDER BY col1 DESC
LIMIT 10
OFFSET 20;`}</CodeBlock>

      <h2 className="text-2xl font-bold mt-12 mb-6">Joins</h2>
      <CodeBlock lang="sql">{`-- INNER JOIN
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- RIGHT JOIN
SELECT u.name, o.total
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- FULL OUTER JOIN
SELECT u.name, o.total
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;`}</CodeBlock>

      <h2 className="text-2xl font-bold mt-12 mb-6">CTEs</h2>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">WITH</h3>
      <CodeBlock lang="sql">{`WITH high_value AS (
    SELECT user_id, SUM(total) AS lifetime
    FROM orders
    GROUP BY user_id
    HAVING SUM(total) > 1000
)
SELECT u.name, hv.lifetime
FROM users u
JOIN high_value hv ON u.id = hv.user_id;`}</CodeBlock>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">WITH RECURSIVE</h3>
      <CodeBlock lang="sql">{`WITH RECURSIVE reachable(node) AS (
    SELECT dst FROM follows WHERE src = 1
    UNION
    SELECT f.dst
    FROM follows f
    JOIN reachable r ON f.src = r.node
)
SELECT * FROM reachable;`}</CodeBlock>

      <h2 className="text-2xl font-bold mt-12 mb-6">Window functions</h2>
      <CodeBlock lang="sql">{`SELECT
    user_id,
    total,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total DESC) AS rn,
    RANK()       OVER (PARTITION BY user_id ORDER BY total DESC) AS rnk,
    LAG(total)   OVER (PARTITION BY user_id ORDER BY total)      AS prev_total,
    LEAD(total)  OVER (PARTITION BY user_id ORDER BY total)      AS next_total
FROM orders;`}</CodeBlock>

      <h2 className="text-2xl font-bold mt-12 mb-6">Transactions</h2>
      <CodeBlock lang="sql">{`BEGIN;
INSERT INTO orders VALUES (101, 7, 49.99, 'pending');
UPDATE users SET last_order = 101 WHERE id = 7;
COMMIT;

-- or rollback:
BEGIN;
DELETE FROM orders WHERE id = 101;
ROLLBACK;`}</CodeBlock>

      <h2 className="text-2xl font-bold mt-12 mb-6">Operators</h2>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">Standard</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left py-2 pr-8 text-[#6b7280] font-semibold">Operator</th>
              <th className="text-left py-2 text-[#6b7280] font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e] text-[#9ca3af]">
            {[
              ['=', 'Equality'],
              ['<>', 'Inequality'],
              ['<, >, <=, >=', 'Comparison'],
              ['AND, OR, NOT', 'Boolean logic'],
              ['LIKE', 'Pattern match (% wildcard)'],
              ['IN', 'Set membership'],
              ['IS NULL / IS NOT NULL', 'Null check'],
              ['BETWEEN', 'Range check (inclusive)'],
            ].map(([op, desc]) => (
              <tr key={op}>
                <td className="py-2 pr-8 font-mono text-[#c4b5fd] text-xs">{op}</td>
                <td className="py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">JSONB</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left py-2 pr-8 text-[#6b7280] font-semibold">Operator</th>
              <th className="text-left py-2 text-[#6b7280] font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e] text-[#9ca3af]">
            {[
              ['->', 'Extract object key, returns JSONB'],
              ['->>', 'Extract object key, returns TEXT'],
              ['@>', 'Containment check (left contains right)'],
              ['?', 'Key existence check'],
              ['||', 'Merge two JSONB objects'],
              ['#>', 'Navigate path (array of keys)'],
            ].map(([op, desc]) => (
              <tr key={op}>
                <td className="py-2 pr-8 font-mono text-[#c4b5fd] text-xs">{op}</td>
                <td className="py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">Vector</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left py-2 pr-8 text-[#6b7280] font-semibold">Operator</th>
              <th className="text-left py-2 text-[#6b7280] font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e] text-[#9ca3af]">
            <tr>
              <td className="py-2 pr-8 font-mono text-[#c4b5fd] text-xs">{'<->'}</td>
              <td className="py-2">L2 (Euclidean) distance between two vectors</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-8 mb-3 text-[#c4b5fd]">Graph functions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left py-2 pr-8 text-[#6b7280] font-semibold">Function</th>
              <th className="text-left py-2 text-[#6b7280] font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e] text-[#9ca3af]">
            {[
              ['oigrap_shortest_path(table, src, dst)', 'BFS shortest path, returns hop count or -1'],
              ['oigrap_pagerank(table, node)', '20-iteration PageRank with damping 0.85'],
            ].map(([fn, desc]) => (
              <tr key={fn}>
                <td className="py-2 pr-8 font-mono text-[#c4b5fd] text-xs whitespace-nowrap">{fn}</td>
                <td className="py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">Data types</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left py-2 pr-8 text-[#6b7280] font-semibold">Type</th>
              <th className="text-left py-2 text-[#6b7280] font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e] text-[#9ca3af]">
            {[
              ['INTEGER', '32-bit signed integer'],
              ['BIGINT', '64-bit signed integer'],
              ['FLOAT', '32-bit floating point'],
              ['DOUBLE PRECISION', '64-bit floating point'],
              ['TEXT', 'Variable-length string'],
              ['BOOLEAN', 'true / false'],
              ['VECTOR', "Stored as TEXT JSON array, e.g. '[0.1, 0.4, 0.9]'"],
              ['JSONB', 'Stored as TEXT internally; engine handles binary encoding transparently'],
            ].map(([type, notes]) => (
              <tr key={type}>
                <td className="py-2 pr-8 font-mono text-[#c4b5fd] text-xs">{type}</td>
                <td className="py-2">{notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">System functions</h2>
      <CodeBlock lang="sql">{`SELECT version();
SELECT current_database();
SELECT current_schema();
SELECT pg_backend_pid();`}</CodeBlock>

      <h2 className="text-2xl font-bold mt-12 mb-6">ANALYZE</h2>
      <p className="text-[#9ca3af] text-sm leading-relaxed mb-3">
        Updates the query planner statistics for a table. Run after large bulk inserts to improve plan quality.
      </p>
      <CodeBlock lang="sql">ANALYZE table_name;</CodeBlock>
    </div>
  );
}
