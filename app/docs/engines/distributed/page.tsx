import { CodeBlock } from '../../../components/CodeBlock';
import { Callout } from '../../../components/Callout';

export default function DistributedPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">Engines / Distributed</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Distributed Engine</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        oigrap&apos;s distributed layer is built from scratch: a RAFT consensus implementation,
        a range-partitioned shard router, and a two-phase commit coordinator. All three are
        implemented as a separate <code className="font-mono text-[#c4b5fd] text-xs">crates/raft</code> crate
        with no external consensus or distributed systems libraries.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">RAFT consensus</h2>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Configuration</h3>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Parameter</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Value</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['election_timeout_min_ms', '150 ms', 'Minimum follower timeout before starting election'],
              ['election_timeout_max_ms', '300 ms', 'Maximum follower timeout (randomised in range)'],
              ['heartbeat_interval_ms', '50 ms', 'Leader sends AppendEntries to all peers at this interval'],
            ].map(([p, v, n]) => (
              <tr key={p} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{p}</td>
                <td className="px-4 py-2 font-mono text-[#f0f0f0] text-xs">{v}</td>
                <td className="px-4 py-2 text-[#6b7280] text-xs">{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Leader election</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        When a follower&apos;s election timer fires, it increments its term, transitions to Candidate,
        votes for itself, and sends <code className="font-mono text-[#c4b5fd] text-xs">RequestVote</code> RPCs to all peers.
        A node wins if it receives votes from <code className="font-mono text-[#c4b5fd] text-xs">floor(peers.len() / 2) + 1</code> nodes
        (including itself). A single-node cluster wins immediately without sending any RPCs.
      </p>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Vote grant conditions (both must hold):
      </p>
      <ol className="text-[#6b7280] text-sm leading-relaxed mb-4 space-y-1 list-decimal list-inside">
        <li>The receiver has not yet voted in this term, or already voted for this candidate.</li>
        <li>The candidate&apos;s log is at least as up-to-date (by last_log_term, then last_log_index).</li>
      </ol>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Log replication</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        The leader tracks <code className="font-mono text-[#c4b5fd] text-xs">next_index</code> and{' '}
        <code className="font-mono text-[#c4b5fd] text-xs">match_index</code> per peer (initialised to
        last_log_index+1 and 0 respectively on election). Heartbeat RPCs carry any entries the peer
        is missing. On a negative response, the leader decrements next_index using the peer&apos;s
        match_index hint for fast rollback instead of decrementing by one.
      </p>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Commit advancement: the leader scans from commit_index+1 upward, finding the highest N where
        a quorum of nodes (self + peers with match_index &ge; N) has the entry and the entry is from
        the current term.
      </p>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Log entry structure</h3>
      <CodeBlock lang="rust">{`pub struct LogEntry {
    pub term:  u64,    // election term when entry was created
    pub index: u64,    // 1-based log position
    pub data:  Vec<u8> // opaque command bytes
}`}</CodeBlock>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Log compaction and snapshots</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        The leader calls <code className="font-mono text-[#c4b5fd] text-xs">create_snapshot(index, data)</code> to
        discard log entries up to and including <em>index</em> and store a state machine snapshot.
        Followers that are too far behind (their next_index is at or before the snapshot base index)
        receive an <code className="font-mono text-[#c4b5fd] text-xs">InstallSnapshot</code> RPC
        from <code className="font-mono text-[#c4b5fd] text-xs">maybe_install_snapshot()</code> instead of incremental entries.
      </p>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        The in-memory log structure after compaction: a sentinel entry at base_index is retained; all
        earlier entries are discarded. <code className="font-mono text-[#c4b5fd] text-xs">get(index)</code> returns None for
        any index before base_index.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Transport wire format</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        All RAFT RPCs use TCP with a 4-byte little-endian length-prefixed framing:
      </p>
      <CodeBlock lang="text">{`[u32 payload_len LE][payload bytes]`}</CodeBlock>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        The first byte of every payload is a message type tag:
      </p>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Tag</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Message</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Fields (after tag)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['0x01', 'AppendEntriesReq', 'term u64, leader_id u64, prev_log_index u64, prev_log_term u64, [entries: count u32, per-entry: term u64 + index u64 + data bytes], leader_commit u64'],
              ['0x02', 'AppendEntriesResp', 'term u64, success bool(1B), match_index u64'],
              ['0x03', 'RequestVoteReq', 'term u64, candidate_id u64, last_log_index u64, last_log_term u64'],
              ['0x04', 'RequestVoteResp', 'term u64, vote_granted bool(1B)'],
              ['0x05', 'InstallSnapshotReq', 'term u64, leader_id u64, last_included_index u64, last_included_term u64, data bytes(len-prefixed)'],
              ['0x06', 'InstallSnapshotResp', 'term u64'],
            ].map(([tag, msg, fields]) => (
              <tr key={tag} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#818cf8] text-xs">{tag}</td>
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{msg}</td>
                <td className="px-4 py-2 text-[#6b7280] text-xs leading-relaxed">{fields}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        All multi-byte integers are little-endian. <code className="font-mono text-[#c4b5fd] text-xs">TcpTransport</code> maintains
        a per-peer connection pool. On send failure, it evicts the cached connection and retries once
        with a fresh TCP connection before returning None.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Shard router</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] text-xs">ShardRouter</code> maps byte-key ranges to shard IDs.
        Each shard owns a contiguous range <code className="font-mono text-[#c4b5fd] text-xs">[start_key, end_key)</code>.
        An empty end_key means the range is unbounded (covers everything from start_key onward).
        Ranges are kept sorted by start_key.
      </p>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Routing algorithm</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] text-xs">route(key)</code> uses{' '}
        <code className="font-mono text-[#c4b5fd] text-xs">partition_point</code> to binary-search for the
        last shard where <code className="font-mono text-[#c4b5fd] text-xs">start_key &le; key</code>,
        then checks that <code className="font-mono text-[#c4b5fd] text-xs">end_key</code> is empty or
        greater than <em>key</em>.
      </p>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] text-xs">find_shards_in_range(low, high)</code> returns all
        shard IDs whose range overlaps <em>[low, high]</em>. Overlap condition:
        <code className="font-mono text-[#c4b5fd] text-xs"> start_key &le; high AND (end_key empty OR end_key &ge; low)</code>.
      </p>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Shard splitting</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] text-xs">split_shard(shard_id, split_key, new_shard_id, new_nodes)</code> atomically
        divides one shard into two. The original shard&apos;s end_key is updated to split_key;
        a new shard is inserted with range [split_key, original_end_key).
      </p>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Query fan-out</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] text-xs">ShardExecutor.fanout_query(sql, key_range)</code> sends
        the SQL string to all shards covering the key range, or all shards if key_range is None.
        Each shard is contacted over TCP with a 1-second connect timeout. Responses are line-delimited
        tab-separated rows; the sentinel <code className="font-mono text-[#c4b5fd] text-xs">&quot;.&quot;</code> line terminates each shard&apos;s
        result stream. <code className="font-mono text-[#c4b5fd] text-xs">merge_results()</code> unions rows from
        non-errored shards.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Two-phase commit</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Cross-shard writes use classical two-phase commit. The coordinator is{' '}
        <code className="font-mono text-[#c4b5fd] text-xs">TwoPhaseCoordinator</code>; the Raft-integrated
        variant is <code className="font-mono text-[#c4b5fd] text-xs">TwoPhaseRaftCoordinator</code> which
        routes transactions through <code className="font-mono text-[#c4b5fd] text-xs">RaftCluster.two_phase_propose()</code>
        and uses an <code className="font-mono text-[#c4b5fd] text-xs">AtomicU64</code> counter for transaction IDs.
      </p>

      <div className="rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] p-5 my-4 space-y-4">
        <div>
          <span className="font-mono text-xs text-[#818cf8]">Phase 1 — Prepare</span>
          <p className="text-[#6b7280] text-xs mt-1 leading-relaxed">
            Coordinator sends <code className="font-mono text-[#c4b5fd]">Prepare(txn_id)</code> to every participant shard.
            Each participant replies <code className="font-mono text-[#c4b5fd]">PrepareOk</code> or <code className="font-mono text-[#c4b5fd]">PrepareAbort</code>.
            If any participant replies PrepareAbort, the coordinator immediately decides Abort
            (does not wait for remaining votes).
          </p>
        </div>
        <div>
          <span className="font-mono text-xs text-[#818cf8]">Phase 2 — Finalize</span>
          <p className="text-[#6b7280] text-xs mt-1 leading-relaxed">
            If all participants voted PrepareOk, coordinator sends <code className="font-mono text-[#c4b5fd]">Commit(txn_id)</code>.
            Otherwise sends <code className="font-mono text-[#c4b5fd]">Abort(txn_id)</code>. Participants reply with
            <code className="font-mono text-[#c4b5fd]"> CommitAck</code> or <code className="font-mono text-[#c4b5fd]">AbortAck</code>.
            Transaction is complete when all participants have acknowledged.
          </p>
        </div>
      </div>

      <CodeBlock lang="rust">{`// Message types
enum CoordinatorMsg { Prepare { txn_id }, Commit { txn_id }, Abort { txn_id } }
enum ParticipantMsg  { PrepareOk { txn_id, shard_id }, PrepareAbort { txn_id, shard_id },
                       CommitAck { txn_id, shard_id }, AbortAck    { txn_id, shard_id } }`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <Callout type="note">
        The distributed layer is fully implemented as a library. Single-node mode (the default)
        works without any cluster configuration — the single node is always its own quorum.
        Multi-node setup currently requires programmatic configuration via the Rust API.
        SQL DDL for cluster management (ADD NODE, RESHARD) is not yet exposed.
      </Callout>
    </div>
  );
}
