import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ?? 'BDpiHCojyBHSJEc3Rg0fGZMOr6oPqrqOl6-mNZ5xMHY';

export const metadata: Metadata = {
  title: 'NAGOTOSHA - 名古屋メシ図鑑',
  description: '名古屋メシをカードで集めるスマホWeb図鑑ゲーム。今日の1パックを開封しよう。',
  verification: {
    google: googleSiteVerification,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0c0804',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* パック画像を最優先でプリロード */}
        <link rel="preload" href="/packs/morning.webp" as="image" type="image/webp" />
        <link rel="preload" href="/packs/lunch.webp" as="image" type="image/webp" />
        <link rel="preload" href="/packs/dinner.webp" as="image" type="image/webp" />
      </head>
      <body className="bg-bg text-[#2b2118] antialiased">
        <GoogleAnalytics />
        <div className="app-shell max-w-md mx-auto min-h-dvh relative shadow-[0_0_80px_rgba(93,58,24,0.16)]">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
