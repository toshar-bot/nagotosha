
import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'NAGOTOSHA — 名古屋メシ図鑑',
  description: '名古屋メシをカードで集めるゲーム。今日の1枚を引こう。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f7f1e7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-bg text-[#2b2118] antialiased">
        <div className="app-shell max-w-md mx-auto min-h-dvh relative shadow-[0_0_80px_rgba(93,58,24,0.16)]">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
