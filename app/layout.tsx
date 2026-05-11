import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Court Notice Registry — Search Pending Indian Court Cases',
  description:
    'Search and file public notices for pending court cases in India. Verified CNR data from eCourts.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pendingcase.in'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight">
              <span className="text-red-600">⚖</span> PendingCase.in
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/search" className="text-gray-600 hover:text-gray-900">
                Search
              </Link>
              <Link href="/verify" className="text-gray-600 hover:text-gray-900">
                Verify
              </Link>
              <Link
                href="/dashboard/new"
                className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700"
              >
                File notice
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t bg-white mt-12 text-sm text-gray-500">
          <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-4 justify-between">
            <p>
              &copy; {new Date().getFullYear()} PendingCase.in — Court data sourced from eCourts
              India.
            </p>
            <div className="flex gap-4">
              <Link href="/verify" className="hover:text-gray-800">
                Verify a person
              </Link>
              <a
                href={`mailto:${process.env.GRIEVANCE_OFFICER_EMAIL ?? 'grievance@pendingcase.in'}`}
                className="hover:text-gray-800"
              >
                Grievance Officer
              </a>
              <Link href="/admin" className="hover:text-gray-800">
                Admin
              </Link>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 pb-4 text-xs text-gray-400">
            IT Act 2000 §79 Grievance Officer: grievance@pendingcase.in — response within 72 hours.
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  )
}
