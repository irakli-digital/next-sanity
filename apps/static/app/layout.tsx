// oxlint-disable-next-line no-unassigned-import
import './globals.css'

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  )
}
