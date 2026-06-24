import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';

export default function ConfigurationPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">Docs / Configuration</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Configuration</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        oigrap is configured via command-line arguments and environment variables.
        There is no configuration file — all options are passed at startup.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Command-line usage</h2>
      <CodeBlock lang="bash">{`oigrap [bind_address]

# Examples:
oigrap                          # bind 0.0.0.0:7432 (default)
oigrap 127.0.0.1:7432           # localhost only
oigrap 0.0.0.0:9000             # custom port`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Environment variables</h2>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Variable</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Default</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['RUST_LOG', 'info', 'Log level: error, warn, info, debug, trace'],
              ['RUST_BACKTRACE', '0', 'Set to 1 for full backtraces on panic'],
            ].map(([v, def, desc]) => (
              <tr key={v} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{v}</td>
                <td className="px-4 py-2 font-mono text-[#4b5563] text-xs">{def}</td>
                <td className="px-4 py-2 text-[#6b7280] text-xs">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock lang="bash">{`RUST_LOG=debug oigrap 0.0.0.0:7432`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Default limits</h2>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Parameter</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['Buffer pool frames', '256 × 8KB = 2MB'],
              ['WAL buffer', '4MB'],
              ['Page size', '8192 bytes'],
              ['HNSW ef_construction', '200'],
              ['HNSW M (max neighbours per node)', '16'],
              ['PageRank iterations', '20'],
              ['PageRank damping factor', '0.85'],
              ['Hash join spill threshold', '100,000 rows (right side)'],
              ['Spill partition count k', 'ceil(rows / threshold), clamped 2–256'],
            ].map(([p, v]) => (
              <tr key={p} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 text-[#6b7280] text-xs">{p}</td>
                <td className="px-4 py-2 font-mono text-[#f0f0f0] text-xs">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Docker</h2>
      <CodeBlock lang="bash">{`# Run with ephemeral storage (data lost on container stop)
docker run -p 7432:7432 oigrap/oigrap:latest

# Run with persistent storage
docker run -p 7432:7432 \
  -v $(pwd)/data:/data \
  oigrap/oigrap:latest`}</CodeBlock>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">docker-compose.yml</h3>
      <CodeBlock lang="yaml">{`version: "3.9"

services:
  oigrap:
    image: oigrap/oigrap:latest
    ports:
      - "7432:7432"
    volumes:
      - oigrap_data:/data
    restart: unless-stopped
    environment:
      RUST_LOG: info
    healthcheck:
      test: ["CMD-SHELL", "nc -z localhost 7432 || exit 1"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  oigrap_data:`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Data directory</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        When running from source without Docker, oigrap uses a temporary directory by default.
        Data is lost when the process exits. To persist data, the server code in{' '}
        <code className="font-mono text-[#c4b5fd] bg-[#111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">DbHandle::open(path)</code> accepts
        a directory path. The directory will contain:
      </p>
      <CodeBlock lang="bash">{`data/
  db        # heap file (slotted pages)
  wal       # write-ahead log
  *.col     # columnar store files (one per table)`}</CodeBlock>

      <Callout type="note">
        On startup, oigrap runs ARIES recovery automatically: it flushes the WAL,
        replays the redo pass, then runs the undo pass to mark crash-active
        transactions as aborted. No manual recovery steps are needed.
      </Callout>
    </div>
  );
}
