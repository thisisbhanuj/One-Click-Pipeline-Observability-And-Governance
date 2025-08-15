import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { CONSTANTS } from '@/lib/constants'

export const metadata: Metadata = {
  title: CONSTANTS.APP_TITLE,
  applicationName: CONSTANTS.APP_TITLE,
  description: CONSTANTS.APP_DESCRIPTION,
  authors: {url: CONSTANTS.GIT_REPO, name: 'BHANUJ'},
  creator: 'BHANUJ',
  publisher: 'BHANUJ'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
            html {
              font-family: ${GeistSans.style.fontFamily};
              --font-sans: ${GeistSans.variable};
              --font-mono: ${GeistMono.variable};
            }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
