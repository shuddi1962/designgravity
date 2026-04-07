import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'DesignGravity — Design Without Limits',
  description: 'AI-powered creative suite for stunning designs, videos, and more.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0A0F] text-[#F8F8FC] antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#141420',
                color: '#F8F8FC',
                border: '1px solid #2A2A3E',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
