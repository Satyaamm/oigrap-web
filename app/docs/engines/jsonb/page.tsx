import { CodeBlock } from '../../../components/CodeBlock';
import { Callout } from '../../../components/Callout';

export default function JsonbPage() {
  return (
    <div>
      <p className="text-xs font-mono text-[#4b5563] mb-4">docs / engines / jsonb</p>
      <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">JSONB</h1>
      <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-prose">
        oigrap stores JSON documents in a self-describing 8-tag binary format with a built-in
        recursive-descent JSON parser, the full operator set, and a GIN index with posting lists.
        No external JSON library is used.
      </p>

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Binary encoding</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        Each JSONB value starts with a 1-byte type tag followed by the encoded payload:
      </p>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Tag</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Type</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['0x01', 'Null', '(none)'],
              ['0x02', 'Bool false', '(none)'],
              ['0x03', 'Bool true', '(none)'],
              ['0x04', 'Int64', '8 bytes little-endian signed'],
              ['0x05', 'Float64', '8 bytes little-endian IEEE 754'],
              ['0x06', 'String', '4-byte length (u32 LE) + UTF-8 bytes'],
              ['0x07', 'Array', '4-byte element count (u32 LE) + encoded elements'],
              ['0x08', 'Object', '4-byte pair count (u32 LE) + (string-key, value) pairs'],
            ].map(([tag, type_, payload]) => (
              <tr key={tag} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{tag}</td>
                <td className="px-4 py-2 text-[#f0f0f0] text-xs">{type_}</td>
                <td className="px-4 py-2 text-[#6b7280] text-xs">{payload}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[#6b7280] text-sm leading-relaxed">
        The format is recursive — array elements and object values are each a complete JSONB-encoded
        value, allowing arbitrary nesting. Object keys are always encoded as Tag 0x06 (String).
      </p>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Built-in JSON parser</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        The <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">JsonParser</code> struct
        is a hand-written recursive-descent parser over a UTF-8 byte slice. It handles:
      </p>
      <ul className="text-[#6b7280] text-sm leading-relaxed space-y-1 list-disc list-inside mb-4">
        <li>Nested objects and arrays with arbitrary depth</li>
        <li>String escape sequences: <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">{`\\"`}</code>, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">{`\\\\`}</code>, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">\n</code>, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">\r</code>, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">\t</code>, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">{`\\uXXXX`}</code> Unicode escapes</li>
        <li>Integer and floating-point numbers including scientific notation (e/E)</li>
        <li><code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">true</code>, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">false</code>, <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">null</code></li>
        <li>Trailing-garbage detection — fails if non-whitespace follows the root value</li>
      </ul>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">Operators</h2>
      <div className="rounded-lg border border-[#1e1e1e] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#111]">
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Operator</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Implementation</th>
              <th className="text-left px-4 py-2 text-[#6b7280] font-medium">Returns</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {[
              ['-> key', 'jsonb_get_key()', 'JSONB (binary)'],
              ['->> key', 'jsonb_to_text(jsonb_get_key())', 'TEXT'],
              ['@> rhs', 'jsonb_contains()', 'BOOLEAN'],
              ['? key', 'jsonb_get_key() != null', 'BOOLEAN'],
              ['||', 'Object / array merge', 'JSONB'],
              ['#> path', 'Path navigation (array of key strings)', 'JSONB'],
            ].map(([op, fn_, ret]) => (
              <tr key={op} className="bg-[#0f0f0f]">
                <td className="px-4 py-2 font-mono text-[#c4b5fd] text-xs">{op}</td>
                <td className="px-4 py-2 text-[#6b7280] text-xs">{fn_}</td>
                <td className="px-4 py-2 font-mono text-[#f0f0f0] text-xs">{ret}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-[#d1d5db] mt-8 mb-3">Containment semantics (@&gt;)</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">jsonb_contains(outer, inner)</code>
        decodes both values and applies <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">json_contains_val()</code> recursively:
      </p>
      <ul className="text-[#6b7280] text-sm leading-relaxed space-y-1 list-disc list-inside mb-4">
        <li><strong className="text-[#d1d5db]">Object @&gt; object:</strong> every key-value pair in the right side must exist recursively in the left side.</li>
        <li><strong className="text-[#d1d5db]">Array @&gt; array:</strong> every element in the right side must appear somewhere in the left side.</li>
        <li><strong className="text-[#d1d5db]">Array @&gt; scalar:</strong> the scalar must be an element of the array.</li>
        <li><strong className="text-[#d1d5db]">Scalar @&gt; scalar:</strong> values must be equal.</li>
      </ul>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">GIN index</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
        A Generalized Inverted Index on JSONB columns stores posting lists mapping each top-level key
        to the set of row IDs containing it. This accelerates <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs">?</code> and
        <code className="font-mono text-[#c4b5fd] bg-[#111111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-xs"> @&gt;</code> queries without a full table scan.
      </p>
      <CodeBlock lang="sql">{`CREATE GIN INDEX ON events (payload);`}</CodeBlock>

      <hr className="border-[#1e1e1e] my-10" />

      <h2 className="text-xl font-bold text-[#f0f0f0] mt-12 mb-4">SQL usage</h2>
      <CodeBlock lang="sql">{`CREATE TABLE events (
    id      INTEGER,
    payload TEXT
);

INSERT INTO events VALUES
  (1, '{"type":"click","user":{"id":42,"tags":["admin","beta"]}}'),
  (2, '{"type":"view","user":{"id":7,"tags":["beta"]}}'),
  (3, '{"type":"click","user":{"id":99}}');

-- Navigate to nested field (->) then extract as text (->>)
SELECT id, payload -> 'user' ->> 'id' AS user_id
FROM   events
WHERE  payload ->> 'type' = 'click';

-- Containment check
SELECT id FROM events
WHERE  payload @> '{"type":"click"}';

-- Key existence
SELECT id FROM events
WHERE  payload ? 'type';

-- Path navigation
SELECT id, payload #> '["user","id"]' AS uid
FROM   events;`}</CodeBlock>

      <Callout type="note">
        JSONB columns are stored as TEXT in the heap; binary encoding and operator evaluation occur
        at query time. A native binary JSONB heap type is on the roadmap.
      </Callout>
    </div>
  );
}
