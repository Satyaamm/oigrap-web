import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';

export default function WireProtocolPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">Docs / Connecting clients</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Connecting clients</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        oigrap implements PostgreSQL Frontend/Backend Protocol v3. Any psql-compatible client
        connects without a special driver. Default port is <strong className="text-[#f0f0f0]">7432</strong> — safe to run alongside PostgreSQL on 5432.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Connection examples</h2>
      <CodeBlock lang="bash">{`# psql
psql -h localhost -p 7432 -U postgres

# Python psycopg2
import psycopg2
conn = psycopg2.connect(host="localhost", port=7432, user="postgres", dbname="postgres")

# Node.js
const { Pool } = require('pg')
const pool = new Pool({ host: 'localhost', port: 7432, user: 'postgres' })

# Go pgx
conn, _ := pgx.Connect(ctx, "postgres://postgres@localhost:7432/postgres")

# SQLAlchemy
engine = create_engine("postgresql+psycopg2://postgres@localhost:7432/postgres")

# JDBC
DriverManager.getConnection("jdbc:postgresql://localhost:7432/postgres", "postgres", "")`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Client compatibility</h2>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Client</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Status</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['psql','Works','Full simple + extended query'],
              ['psycopg2 / psycopg3','Works','Use trust or MD5 auth'],
              ['node-postgres','Works',''],
              ['pgx (Go)','Works',''],
              ['JDBC','Works','sslmode=disable or accept self-signed cert'],
              ['SQLAlchemy','Works','Uses pg_catalog shim for introspection'],
              ['DBeaver / TablePlus','Works','Add PostgreSQL connection on port 7432'],
              ['DataGrip','Works','PostgreSQL data source, port 7432'],
              ['Metabase / Grafana','Works','PostgreSQL source plugin'],
              ['dbt (dbt-postgres)','Partial','Core queries work; some introspection may fail'],
            ].map(([client, status, notes]) => (
              <tr key={client} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#f0f0f0] text-xs">{client}</td>
                <td className="px-4 py-2 text-xs">
                  <span className={status === 'Works' ? 'text-[#34d399]' : 'text-[#f59e0b]'}>{status}</span>
                </td>
                <td className="px-4 py-2 text-[#4b5563] text-xs">{notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Authentication</h2>
      <ul className="text-[#6b7280] text-sm leading-relaxed space-y-3 list-disc list-inside mb-4">
        <li><strong className="text-[#f0f0f0]">Trust</strong> — default, no password required.</li>
        <li><strong className="text-[#f0f0f0]">MD5</strong> — challenge-response: MD5(MD5(password+username)+salt). Full RFC 1321.</li>
      </ul>
      <Callout type="note">
        SCRAM-SHA-256 (PostgreSQL 14+ default) is not implemented. Configure your client
        to use MD5 or password-less (trust) authentication.
      </Callout>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">TLS</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        TLS is supported via rustls. oigrap generates an ephemeral self-signed certificate via rcgen on startup.
        Clients must accept self-signed certs.
      </p>
      <CodeBlock lang="bash">{`# psql with TLS (accept self-signed)
psql "host=localhost port=7432 user=postgres sslmode=require sslrootcert=/dev/null"

# node-postgres
const pool = new Pool({ port: 7432, ssl: { rejectUnauthorized: false } })`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">pg_catalog shim</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Virtual tables for GUI tools and ORMs. All of these work:
      </p>
      <CodeBlock lang="sql">{`SELECT * FROM pg_catalog.pg_tables;
SELECT * FROM pg_catalog.pg_type;
SELECT * FROM pg_catalog.pg_attribute;
SELECT * FROM information_schema.tables;
SELECT * FROM information_schema.columns;
SELECT version();
SELECT current_database();
SET search_path TO public;
SHOW server_version;`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Known limitations</h2>
      <ul className="text-[#6b7280] text-sm leading-relaxed space-y-2 list-disc list-inside">
        <li>No SCRAM-SHA-256 authentication.</li>
        <li>Text wire format only — no binary format for all types.</li>
        <li>Partial pg_catalog coverage — some ORM introspection queries may return empty.</li>
        <li>Prepared statement parameter type inference is limited.</li>
      </ul>
    </div>
  );
}
