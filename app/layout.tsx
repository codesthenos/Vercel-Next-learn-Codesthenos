import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acme Codesthenos Dashboard',
  description: 'The official Next.js Course Dashboard, built with App Router. By codesthenos',
  metadataBase: new URL('https://vercel-next-learn-codesthenos.vercel.app/')
}

interface Props {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
