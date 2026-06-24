import { CodeBlock } from '../../../components/CodeBlock';
import { Callout } from '../../../components/Callout';

export default function GraphPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / engines / graph</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Graph</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        oigrap provides graph primitives directly in SQL: shortest path, PageRank, and recursive
        graph traversal via WITH RECURSIVE CTEs with cycle detection. No separate graph database
        or ETL step is required — edges can be ordinary rows in any table.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">oigrap_shortest_path()</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">oigrap_shortest_path(source_id, target_id, edge_table, from_col, to_col)</code>
        runs a BFS from <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">source_id</code> to <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">target_id</code>
        over the edge table specified by name. Column names for from and to are passed as arguments.
        It returns the hop count as BIGINT, or NULL if no path exists. Returns 0 if source equals target.
        The edge table is loaded into a thread-local <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">EDGE_CACHE</code> once per query and cleared after.
      </p>
      <CodeBlock lang="sql">{`CREATE TABLE edges (
    src INTEGER,
    dst INTEGER
);

INSERT INTO edges VALUES (1, 2), (2, 3), (3, 4), (2, 4);

-- Shortest path from node 1 to node 4 = 2 hops (1->2->4)
SELECT oigrap_shortest_path(1, 4, 'edges', 'src', 'dst');
-- Result: 2

-- Path does not exist (directed graph)
SELECT oigrap_shortest_path(4, 1, 'edges', 'src', 'dst');
-- Result: NULL`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">oigrap_pagerank()</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">oigrap_pagerank(node_id, edge_table, from_col, to_col)</code>
        computes PageRank via 20-iteration power iteration with damping factor 0.85 and returns
        the score for the specified node_id as Float64. The
        result is cached in a thread-local <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">PAGERANK_CACHE</code> so repeated
        calls on the same edge table within one query do not re-run the 20 iterations.
      </p>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        The power iteration formula used per step is:
      </p>
      <CodeBlock lang="text">{`PR(v) = (1 - d) / N + d × Σ PR(u) / out_degree(u)
                           u ∈ in_neighbors(v)

where d = 0.85, N = number of nodes, iterations = 20`}</CodeBlock>
      <CodeBlock lang="sql">{`-- Score for one specific node
SELECT oigrap_pagerank(3, 'edges', 'src', 'dst') AS score;

-- Rank all nodes
SELECT src, oigrap_pagerank(src, 'edges', 'src', 'dst') AS score
FROM   (SELECT DISTINCT src FROM edges) AS nodes
ORDER BY score DESC
LIMIT 10;`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">WITH RECURSIVE CTEs</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        oigrap supports standard SQL <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">WITH RECURSIVE</code> CTEs for
        graph traversal directly in SQL. The implementation uses BFS semantics with cycle detection
        via a <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">HashSet</code> of visited node IDs maintained across iterations.
        The special function <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">DEPTH()</code> returns the
        current recursion depth via a thread-local <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">Cell&lt;i64&gt;</code>.
      </p>
      <CodeBlock lang="sql">{`-- BFS traversal: all nodes reachable from node 1
WITH RECURSIVE reachable(node) AS (
    SELECT 1                        -- seed: start node
    UNION ALL
    SELECT e.dst
    FROM   edges e
    JOIN   reachable r ON e.src = r.node
)
SELECT node FROM reachable;

-- Include depth
WITH RECURSIVE reachable(node, depth) AS (
    SELECT 1, 0
    UNION ALL
    SELECT e.dst, r.depth + 1
    FROM   edges e
    JOIN   reachable r ON e.src = r.node
    WHERE  r.depth < 5              -- max hops
)
SELECT node, depth FROM reachable ORDER BY depth;

-- Hierarchical closure: all ancestors of an employee
WITH RECURSIVE ancestors(id, level) AS (
    SELECT manager_id, 1
    FROM   employees
    WHERE  id = 42
    UNION ALL
    SELECT e.manager_id, a.level + 1
    FROM   employees e
    JOIN   ancestors a ON e.id = a.id
    WHERE  a.level < 10
)
SELECT id, level FROM ancestors;`}</CodeBlock>

      <Callout type="note">
        Cycle detection in WITH RECURSIVE operates at the row level using the HashSet of visited
        node IDs accumulated across all iterations. To prevent infinite loops in cyclic graphs,
        always include a depth or iteration limit in the recursive term&apos;s WHERE clause.
      </Callout>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Combining graph, vector, and JSONB</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Because all engines share one SQL surface, graph traversal results can be joined against
        vector similarity search or JSONB document queries in the same statement:
      </p>
      <CodeBlock lang="sql">{`-- Users within 2 hops who also match a vector similarity threshold
WITH RECURSIVE friends(id) AS (
    SELECT 42
    UNION ALL
    SELECT e.dst
    FROM   social_graph e
    JOIN   friends f ON e.src = f.id
)
SELECT u.id, u.name, u.bio_vec <-> '[0.3, 0.7, 0.1]' AS dist
FROM   users u
JOIN   friends f ON u.id = f.id
WHERE  DEPTH() <= 2
ORDER BY dist
LIMIT 10;`}</CodeBlock>
    </div>
  );
}
