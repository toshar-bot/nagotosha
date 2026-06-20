
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
  themeColor: '#15110d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-bg text-white antialiased">
        <div className="app-shell max-w-md mx-auto min-h-dvh relative shadow-[0_0_80px_rgba(0,0,0,0.28)]">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
