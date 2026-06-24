import Link from 'next/link';
import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';

export default function QuickstartPage() {
  return (
    <div className="text-[#f0f0f0]">
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / quick start</p>
      <h1 className="text-4xl font-black mb-4 tracking-tight">Quick start</h1>
      <p className="text-[#9ca3af] text-lg leading-relaxed mb-8">
        Have oigrap running in under 5 minutes.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Prerequisites</h2>
      <p className="text-[#9ca3af] text-sm leading-relaxed mb-4">
        Option A requires Docker. Option B requires the Rust toolchain (cargo).
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Option A -- Docker</h2>
      <CodeBlock lang="bash">docker run -p 7432:7432 oigrap/oigrap:latest</CodeBlock>

      <h2 className="text-2xl font-bold mt-10 mb-4">Option B -- Build from source</h2>
      <CodeBlock lang="bash">{`git clone https://github.com/Satyaamm/oigrap
cd oigrap
cargo build --release
./target/release/oigrap 0.0.0.0:7432`}</CodeBlock>
      <Callout type="note">
        The first build downloads and compiles all dependencies. Expect 2-3 minutes on first run.
      </Callout>

      <h2 className="text-2xl font-bold mt-10 mb-4">Connect with psql</h2>
      <CodeBlock lang="bash">psql -h localhost -p 7432 -U postgres</CodeBlock>
      <p className="text-[#9ca3af] text-sm leading-relaxed mt-4">
        No password is required. The server uses trust authentication by default.
        After connecting, you will see the <code className="text-[#c4b5fd] font-mono text-xs">postgres=#</code> prompt.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Your first table</h2>
      <CodeBlock lang="sql">{`CREATE TABLE users (
    id   INTEGER,
    name TEXT,
    age  INTEGER
);

INSERT INTO users VALUES (1, 'Alice', 31);
INSERT INTO users VALUES (2, 'Bob', 27);

SELECT * FROM users WHERE age > 25 ORDER BY age DESC;`}</CodeBlock>

      <h2 className="text-2xl font-bold mt-10 mb-6">Next steps</h2>
      <ul className="space-y-3 text-sm text-[#9ca3af]">
        <li>
          <Link href="/docs/sql" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors">SQL reference</Link>
          {' '} -- full DDL, DML, joins, CTEs, window functions, and operator reference.
        </li>
        <li>
          <Link href="/docs/engines" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors">Engines overview</Link>
          {' '} -- learn when to use each storage engine.
        </li>
        <li>
          <Link href="/docs/wire-protocol" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors">Wire protocol</Link>
          {' '} -- connect psycopg2, node-postgres, SQLAlchemy, and other clients.
        </li>
        <li>
          <Link href="/docs/configuration" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors">Configuration</Link>
          {' '} -- command-line flags, environment variables, Docker.
        </li>
      </ul>
    </div>
  );
}
