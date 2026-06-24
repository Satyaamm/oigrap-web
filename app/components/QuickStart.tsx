'use client';

const BLOCKS = [
  {
    label: 'start',
    code: `# Docker
docker run -p 7432:7432 oigrap/oigrap:latest

# or build from source
cargo build --release
./target/release/oigrap 0.0.0.0:7432`,
  },
  {
    label: 'connect',
    code: `# any PostgreSQL client works
psql -h localhost -p 7432 -U postgres

# Python
import psycopg2
conn = psycopg2.connect(host="localhost", port=7432, user="postgres")

# Node.js
const { Pool } = require('pg')
const pool = new Pool({ port: 7432 })`,
  },
  {
    label: 'query',
    code: `-- create and insert
CREATE TABLE posts (id INT, body TEXT, embedding TEXT);
INSERT INTO posts VALUES (1, 'hello world', '[0.1, 0.4, 0.9]');

-- vector similarity
SELECT id FROM posts ORDER BY embedding <-> '[0.1, 0.5, 0.9]' LIMIT 5;

-- graph traversal
SELECT oigrap_shortest_path('follows', 1, 99) AS hops;

-- jsonb
SELECT body->>'title' FROM posts WHERE body @> '{"published": true}';`,
  },
];

export function QuickStart() {
  return (
    <section id="quickstart" className="px-8 py-24 max-w-5xl mx-auto border-t border-[#1a1a1a]">
      <p className="font-mono text-[#555] text-sm mb-12 uppercase tracking-widest">quick start</p>
      <div className="space-y-10">
        {BLOCKS.map((b) => (
          <div key={b.label}>
            <p className="font-mono text-[#555] text-xs mb-3">#{b.label}</p>
            <pre className="bg-[#111] border border-[#222] rounded-lg p-5 text-[#c4b5fd] font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre">
              {b.code}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
