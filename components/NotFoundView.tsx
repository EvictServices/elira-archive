import Link from 'next/link'

export default function NotFoundView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '1rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>This page doesn&apos;t exist.</p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Go Home</Link>
    </div>
  )
}
