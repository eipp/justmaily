import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

export const metadata = {
  title: 'Maily Platform',
  description: 'AI-Powered Email Marketing Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        'flex flex-col'
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Analytics />
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
