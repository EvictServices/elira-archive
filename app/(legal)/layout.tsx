export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="legal-page doc-page">{children}</div>
}
