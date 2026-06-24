import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'oigrap -- multi-model database engine',
  description:
    'A multi-model database engine built from scratch in Rust. Row storage, columnar OLAP, vector ANN, JSONB, graph, and RAFT unified under one SQL interface.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-[#0d0d0d] text-[#f0f0f0] font-sans antialiased">{children}</body>
    </html>
  );
}
