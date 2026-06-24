'use client';
import { useEffect, useState } from 'react';

const QUERIES = [
  {
    comment: '-- row store: full ACID with serializable isolation',
    lines: [
      'CREATE TABLE events (user_id INT, action TEXT, ts TEXT);',
      "INSERT INTO events VALUES (42, 'login', '2024-01-01');",
      'SELECT COUNT(*) FROM events WHERE user_id = 42;',
    ],
  },
  {
    comment: '-- vector ANN: approximate nearest-neighbor via HNSW',
    lines: [
      'CREATE VECTOR INDEX ON docs (embedding) USING hnsw;',
      '',
      'SELECT title FROM docs',
      "ORDER BY embedding <-> '[0.1, 0.4, 0.9]'",
      'LIMIT 5;',
    ],
  },
  {
    comment: '-- graph: shortest path and PageRank',
    lines: [
      'CREATE TABLE follows (src BIGINT, dst BIGINT);',
      '',
      "SELECT oigrap_shortest_path('follows', 1, 99) AS hops;",
      "SELECT oigrap_pagerank('follows', 1) AS score;",
    ],
  },
  {
    comment: '-- jsonb: document queries with GIN index',
    lines: [
      "SELECT payload->>'name' AS name",
      'FROM records',
      "WHERE payload @> '{\"active\": true}';",
    ],
  },
  {
    comment: '-- columnar OLAP: vectorized aggregation',
    lines: [
      'SELECT region, SUM(revenue), COUNT(*)',
      'FROM sales',
      'GROUP BY region',
      'ORDER BY 2 DESC;',
    ],
  },
];

export function AnimatedTerminal() {
  const [qi, setQi] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'hold' | 'clearing'>('typing');

  const q = QUERIES[qi];
  const full = [q.comment, ...q.lines].join('\n');

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (displayed.length < full.length) {
        t = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 18);
      } else {
        t = setTimeout(() => setPhase('hold'), 2400);
      }
    } else if (phase === 'hold') {
      t = setTimeout(() => setPhase('clearing'), 300);
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(displayed.slice(0, -2)), 6);
      } else {
        setQi((i) => (i + 1) % QUERIES.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(t);
  }, [displayed, phase, full]);

  const lines = displayed.split('\n');

  return (
    <div className="rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] p-6 font-mono text-sm">
      <div className="text-[#4b5563] mb-3 text-xs select-none">postgres=# </div>
      <div className="space-y-0.5 min-h-[120px]">
        {lines.map((line, i) => (
          <div key={i}>
            {line.startsWith('--') ? (
              <span className="text-[#4b5563]">{line}</span>
            ) : line === '' ? (
              <span>&nbsp;</span>
            ) : (
              <span className="text-[#c4b5fd]">{line}</span>
            )}
            {i === lines.length - 1 && (
              <span className="inline-block w-[7px] h-[13px] bg-[#6366f1] ml-0.5 align-text-bottom animate-[blink_1s_step-end_infinite]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
