import { CodeBlock } from '../../../components/CodeBlock';
import { Callout } from '../../../components/Callout';

export default function RowStorePage() {
  return (
    <div className="text-[#f0f0f0]">
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / engines / row store</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">Row store</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        The row store is oigrap&apos;s OLTP engine. It is built on slotted 8KB heap pages, a 256-frame LRU
        buffer pool, B+ tree indexes, a 2PL lock manager with BFS deadlock detection, MVCC with serializable
        snapshot isolation, and ARIES write-ahead logging with full crash recovery.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Page layout</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Every page is exactly 8,192 bytes. The layout is a classic slotted page: a 48-byte header,
        a slot array growing forward from byte 48, and tuple data growing backward from the end.
        Free space is <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">upper - lower</code>.
      </p>
      <CodeBlock lang="text">{`Page (8192 bytes)
+-----------------------------------------+  byte 0
| Header (48 bytes)                       |
|  page_id  u64  @ 0                      |
|  lsn      u64  @ 8   (last WAL LSN)     |
|  checksum u32  @ 16  (CRC32)            |
|  flags    u16  @ 20                     |
|  lower    u16  @ 22  (end of slots)     |
|  upper    u16  @ 24  (start of tuples)  |
|  special  u16  @ 26  (special space)    |
|  xid_base u64  @ 28                     |
|  prune_xid u32 @ 36                     |
|  reserved      @ 40  (8 bytes)          |
+-----------------------------------------+  byte 48
| Slot[0]  u16 offset | u16 length        |
| Slot[1]  ...                            |
|   (lower grows forward)                 |
|                                         |
|         (free space)                    |
|                                         |
|  tuple data (upper grows backward)      |
+-----------------------------------------+  byte 8192`}</CodeBlock>

      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Constant</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['PAGE_SIZE', '8192'],
              ['PAGE_HEADER_SIZE', '48'],
              ['SLOT_SIZE', '4 (two u16s: offset + length)'],
              ['TUPLE_HEADER_SIZE', '24'],
              ['BTREE_SPECIAL_SIZE', '28'],
              ['Buffer pool frames', '256 (2MB total)'],
            ].map(([c, v]) => (
              <tr key={c} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{c}</td>
                <td className="px-4 py-2 font-mono text-[#f0f0f0] text-xs">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">MVCC tuple header</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Every tuple begins with a 24-byte MVCC header. Column data follows immediately at byte 24.
      </p>
      <CodeBlock lang="text">{`Tuple header (24 bytes, little-endian)
  [0..8]   xmin      u64   XID of the inserting transaction
  [8..16]  xmax      u64   0 = live; set to deleting XID on DELETE/UPDATE
  [16..20] cid       u32   command ID within the transaction
  [20..22] infomask  u16   HEAP_XMIN_COMMITTED=0x0100, HEAP_XMIN_INVALID=0x0200,
                            HEAP_XMAX_COMMITTED=0x0400, HEAP_XMAX_INVALID=0x0800,
                            HEAP_UPDATED=0x2000
  [22..24] infomask2 u16   secondary flags`}</CodeBlock>
      <p className="text-[#6b7280] text-sm leading-relaxed mt-4">
        On insert, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">xmin</code> is set to the current XID
        and <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">HEAP_XMIN_COMMITTED</code> is optimistically set.
        VACUUM confirms the flag on the next pass.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">WAL record format</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Every heap mutation writes a WAL record before modifying the in-memory page.
        Each record has a 34-byte header:
      </p>
      <CodeBlock lang="text">{`WAL record header (34 bytes, little-endian)
  [0..8]   lsn          u64   byte offset = LSN
  [8..16]  prev_lsn     u64   previous record in same transaction
  [16..24] xid          u64   transaction ID
  [24]     rmgr_id      u8    0=HEAP  1=XACT
  [25]     record_type  u8    HEAP: 0=INSERT 1=UPDATE 2=DELETE 3=NEWPAGE
                               XACT: 0=COMMIT 1=ABORT  2=CHECKPOINT
  [26..30] total_len    u32   header + body in bytes
  [30..34] crc          u32   CRC32 over header (bytes 30-33 zeroed) + body

WAL buffer: 4MB; auto-flushed at 2MB
Commit durability: flush + fdatasync before acknowledging commit`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Snapshot isolation and SSI</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        A <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">Snapshot</code> captures
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> xmin</code> (lowest in-flight XID),
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> xmax</code> (next XID to be assigned), and
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> active</code> (all in-progress XIDs).
        A tuple is visible when its <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">xmin</code> is committed and
        visible per the snapshot, and <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">xmax</code> is
        either INVALID_XID or not committed/visible.
      </p>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        On top of SI, oigrap implements SSI via rw-anti-dependency cycle detection.
        The transaction manager tracks per-transaction read and write sets as
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> HashSet&lt;(table_id: u32, page_id: u64, slot_id: u16)&gt;</code>.
        At commit time, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">check_ssi_conflict(xid)</code> scans concurrent transactions:
        if T1 read a tuple that T2 wrote, and T2 read a tuple that T1 wrote, a cycle is detected and one
        transaction is aborted with a serialization failure.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">ARIES crash recovery</h2>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Phase</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['Analysis', 'Scan WAL from LSN 0. Build txn_status: XactCommit → Committed, XactAbort → Aborted, unpaired heap records → Active.'],
              ['Redo', 'Replay every record. For each heap record, if page.lsn < record.lsn, re-apply (idempotent by LSN comparison).'],
              ['Undo', 'For each Active transaction, call force_abort(xid). Those tuples become invisible to all future snapshots.'],
            ].map(([p, d]) => (
              <tr key={p} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{p}</td>
                <td className="px-4 py-2 text-[#6b7280] text-xs leading-relaxed">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[#6b7280] text-sm leading-relaxed">
        Recovery runs automatically inside <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">DbHandle::open()</code>.
        No manual steps are required after a crash.
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">SQL example</h2>
      <CodeBlock lang="sql">{`CREATE TABLE products (
    id    INTEGER,
    name  TEXT,
    price FLOAT,
    stock INTEGER
);

INSERT INTO products VALUES (1, 'Widget',    9.99, 100);
INSERT INTO products VALUES (2, 'Gadget',   49.99,  25);
INSERT INTO products VALUES (3, 'Doohickey', 4.99, 500);

-- B+ tree index for range scans
CREATE INDEX idx_price ON products (price);

SELECT name, stock
FROM   products
WHERE  price BETWEEN 5.0 AND 50.0
ORDER BY price;

-- Reclaim space from deleted rows
VACUUM products;`}</CodeBlock>

      <Callout type="note">
        The row store is the default engine for all CREATE TABLE statements. The columnar engine is
        used when a table is explicitly loaded into the columnar store via INSERT into a columnar-backed
        table. Both share the same WAL and catalog.
      </Callout>
    </div>
  );
}
