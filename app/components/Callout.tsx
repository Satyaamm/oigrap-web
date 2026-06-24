interface Props {
  type: 'note' | 'warning' | 'tip';
  children: React.ReactNode;
}

export function Callout({ type, children }: Props) {
  const styles = {
    note:    { border: '#1e3a5f', bg: '#0a1628', label: 'note',    labelColor: '#60a5fa' },
    warning: { border: '#4a2900', bg: '#1a0e00', label: 'warning', labelColor: '#f59e0b' },
    tip:     { border: '#1a3a28', bg: '#071a10', label: 'tip',     labelColor: '#34d399' },
  }[type];

  return (
    <div className="rounded-lg border p-4 my-4 text-sm leading-relaxed" style={{ borderColor: styles.border, background: styles.bg }}>
      <span className="font-mono font-bold text-xs uppercase tracking-wider mr-3" style={{ color: styles.labelColor }}>
        {styles.label}
      </span>
      <span className="text-[#9ca3af]">{children}</span>
    </div>
  );
}
