import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  children?: ReactNode;
}

export function FeatureCard({ title, description, tag, tagColor, children }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d14] p-6 hover:border-indigo-500/30 transition-colors duration-200">
      <span className={`inline-block text-xs font-mono px-2 py-0.5 rounded-full border mb-4 ${tagColor}`}>
        {tag}
      </span>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-[#64748b] text-sm leading-relaxed">{description}</p>
      {children}
    </div>
  );
}
