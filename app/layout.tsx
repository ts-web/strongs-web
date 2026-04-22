import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Strong's Web",
  description: "Browse and search a dataset of entries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`} className="brand">Strong&apos;s Web</a>
        </header>
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
