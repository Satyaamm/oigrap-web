import { CodeBlock } from '../../components/CodeBlock';
import { Callout } from '../../components/Callout';

export default function InternalsPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / internals</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">WAL, MVCC, and ARIES Recovery</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        oigrap implements full ACID guarantees through a custom write-ahead log (WAL),
        multi-version concurrency control (MVCC), serializable snapshot isolation (SSI),
        and ARIES-style crash recovery — all written from scratch in Rust.
        This page documents the exact on-disk formats and algorithms.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">WAL record format</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Every WAL record begins with a fixed 34-byte header, followed by a variable-length body.
        All fields are little-endian. The LSN of a record is its byte offset in the WAL file.
      </p>
      <CodeBlock lang="text">{`WAL record header (34 bytes):
  lsn         u64 LE  -- byte offset of this record (= its LSN)
  prev_lsn    u64 LE  -- LSN of the previous record from the same txn
  xid         u64 LE  -- transaction ID
  rmgr_id     u8      -- resource manager: 0 = HEAP, 1 = XACT
  record_type u8      -- see table below
  total_len   u32 LE  -- header + body size in bytes
  crc32       u32 LE  -- CRC32 over (header with crc=0) || body`}</CodeBlock>

      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">rmgr_id</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">record_type</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Name</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Body</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['0 (HEAP)', '0', 'HeapInsert', 'table_id u32 + page_id u64 + slot_id u16 + tuple_len u16 + tuple_data bytes'],
              ['0 (HEAP)', '1', 'HeapUpdate', 'table_id u32 + old_page u64 + old_slot u16 + new_page u64 + new_slot u16 + old_xmax u64 + new_tuple_len u16 + new_tuple bytes'],
              ['0 (HEAP)', '2', 'HeapDelete', 'table_id u32 + page_id u64 + slot_id u16 + old_xmax u64 (18 bytes)'],
              ['1 (XACT)', '0', 'XactCommit', 'timestamp u64 (microseconds since UNIX epoch)'],
              ['1 (XACT)', '1', 'XactAbort', 'timestamp u64'],
              ['1 (XACT)', '2', 'Checkpoint', 'redo_lsn u64 + next_xid u64 + oldest_xid u64 + active_count u32 + active_xids[] u64'],
            ].map(([rmgr, rt, name, body]) => (
              <tr key={name} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 text-[#818cf8] text-xs">{rmgr}</td>
                <td className="px-4 py-2 text-[#f0f0f0] text-xs">{rt}</td>
                <td className="px-4 py-2 text-[#c4b5fd] text-xs">{name}</td>
                <td className="px-4 py-2 text-[#4b5563] text-xs">{body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        The WAL buffer is 4MB. It flushes to disk automatically when more than 50% full, and always flushes
        before acknowledging a client commit (<code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">fdatasync</code> via <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">File::sync_data()</code>).
        The LSN is a monotonically increasing u64 allocated using an atomic fetch-add.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Tuple header (MVCC)</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Every tuple on every heap page begins with a 24-byte MVCC header:
      </p>
      <CodeBlock lang="text">{`TupleHeader (24 bytes):
  xmin     u64 LE  -- XID of the transaction that created this tuple
  xmax     u64 LE  -- XID of the transaction that deleted this tuple (0 = not deleted)
  cid      u32 LE  -- command ID within the creating transaction
  infomask u16 LE  -- visibility flags (HEAP_XMIN_COMMITTED = 0x0100)
  infomask2 u16 LE -- reserved`}</CodeBlock>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Visibility rule</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        A snapshot is a point-in-time view: <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">{"{ xmin, xmax, active: Vec<Xid> }"}</code>.
        A tuple is visible to a snapshot iff:
      </p>
      <ol className="text-[#6b7280] text-sm leading-relaxed mb-4 space-y-2 list-decimal list-inside">
        <li>The creating transaction (xmin) is committed <em>and</em> not in <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">active</code> at snapshot time.</li>
        <li>Either xmax is <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">INVALID_XID</code> (0, not yet deleted), or the deleting transaction (xmax) is NOT committed-and-visible to the snapshot.</li>
      </ol>
      <CodeBlock lang="text">{`is_committed_before(xid, snap):
  if xid in snap.active  -> false          -- was in-progress at snapshot time
  if xid < snap.xmin     -> committed.contains(xid)
  if xid >= snap.xmax    -> false          -- not yet started
  else                   -> committed.contains(xid)

is_visible(header, snap):
  xmin_committed = is_committed_before(header.xmin, snap)
  if !xmin_committed  -> invisible
  if header.xmax == 0 -> visible
  xmax_visible = is_committed_before(header.xmax, snap)
  return !xmax_visible  -- deleted but deletion not yet visible = still visible`}</CodeBlock>

      <Callout type="note">
        The active-set check precedes the xmin check. A transaction that was in-progress when the
        snapshot was taken must never be visible to that snapshot, even if its XID numerically falls
        below xmin (possible when no transactions had committed yet at snapshot time).
      </Callout>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Serializable snapshot isolation (SSI)</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        SSI detects serialization failures at commit time by checking for rw-anti-dependency cycles.
        Each transaction tracks its read set and write set as sets of <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">(table_id, page_id, slot_id)</code> tuples.
      </p>
      <CodeBlock lang="text">{`check_ssi_conflict(xid):
  for each other active transaction T2:
    if T2.write_set ∩ xid.read_set != ∅:     -- T2 wrote what xid read
      if xid.write_set ∩ T2.read_set != ∅:   -- xid wrote what T2 read
        return true  -- rw-anti-dependency cycle detected`}</CodeBlock>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        On cycle detection, the committing transaction is <strong>aborted</strong> rather than committed,
        and the error is returned to the client as a serialization failure.
        The aborted transaction's read and write sets are cleaned up immediately.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">ARIES crash recovery</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Recovery runs automatically on startup in three phases:
      </p>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-6 mb-3">Phase 1 — Analysis</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Scan the entire WAL from LSN 0. Build a transaction table:
        each XID maps to Committed, Aborted, or Active (no commit/abort record seen).
      </p>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-6 mb-3">Phase 2 — Redo</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Replay every HeapInsert, HeapUpdate, and HeapDelete record. Each record is applied only if
        the page's on-disk LSN is less than the record's LSN — this makes redo idempotent.
        XactCommit, XactAbort, and Checkpoint records have no page-level redo action.
      </p>
      <CodeBlock lang="text">{`redo_record(pool, rec):
  frame = pool.fetch_page(rec.page_id)
  if pool.page(frame).lsn() < rec.lsn:
    apply_record_to_page(...)
    pool.page_mut(frame).set_lsn(rec.lsn)
    pool.unpin_page(dirty=true)
  else:
    pool.unpin_page(dirty=false)   -- already current, skip`}</CodeBlock>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-6 mb-3">Phase 3 — Undo</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        All transactions that had WAL records but no commit or abort record are marked as aborted via
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> force_abort()</code>.
        Their tuples are invisible to any snapshot taken after recovery.
        No WAL record is written during undo — it is an in-memory state update only.
      </p>

      <Callout type="note">
        After recovery, <code className="font-mono text-xs">next_xid</code> is advanced past the highest XID seen in the WAL,
        ensuring new transactions never reuse a XID from a crashed session.
      </Callout>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Transaction lifecycle</h2>
      <CodeBlock lang="sql">{`BEGIN;
  -- read_set and write_set tracking begins
  INSERT INTO t VALUES (...);       -- WAL HeapInsert buffered; write_set += slot
  SELECT * FROM t WHERE ...;        -- read_set += scanned slots
COMMIT;
  -- 1. check_ssi_conflict() -- abort if cycle detected
  -- 2. write XactCommit record to WAL
  -- 3. fdatasync (WAL must be on disk before client ACK)
  -- 4. mark committed in-memory`}</CodeBlock>
    </div>
  );
}
