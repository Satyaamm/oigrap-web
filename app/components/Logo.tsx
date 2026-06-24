export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="20,2 36,11 36,29 20,38 4,29 4,11"
        stroke="#6366f1"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="20" y1="2" x2="20" y2="38" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
      <line x1="4" y1="11" x2="36" y2="29" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
      <line x1="36" y1="11" x2="4" y2="29" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
      <circle cx="20" cy="20" r="3" fill="#6366f1" />
      <circle cx="20" cy="5" r="1.5" fill="#a78bfa" />
      <circle cx="34" cy="13.5" r="1.5" fill="#a78bfa" />
      <circle cx="34" cy="26.5" r="1.5" fill="#a78bfa" />
      <circle cx="20" cy="35" r="1.5" fill="#a78bfa" />
      <circle cx="6" cy="26.5" r="1.5" fill="#a78bfa" />
      <circle cx="6" cy="13.5" r="1.5" fill="#a78bfa" />
    </svg>
  );
}
