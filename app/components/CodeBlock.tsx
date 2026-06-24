interface Props {
  lang?: string;
  children: string;
}

export function CodeBlock({ lang, children }: Props) {
  return (
    <div className="rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] overflow-hidden my-4">
      {lang && (
        <div className="px-4 py-2 border-b border-[#1e1e1e] flex items-center justify-between">
          <span className="text-xs font-mono text-[#4b5563]">{lang}</span>
        </div>
      )}
      <pre className="p-5 overflow-x-auto text-sm font-mono text-[#c4b5fd] leading-relaxed whitespace-pre">
        {children}
      </pre>
    </div>
  );
}
