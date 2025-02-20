import { Inter } from 'next/font/google'
import './globals.css'
import { HistoryProvider } from '@/lib/contexts/history-context'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <HistoryProvider>
          {children}
        </HistoryProvider>
      </body>
    </html>
  )
}