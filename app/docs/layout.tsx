import DocsSidebar from '@/components/docs/DocsSidebar'
import DocsLightbox from '@/components/docs/DocsLightbox'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-layout">
      <DocsSidebar />
      <div className="docs-main">{children}</div>
      <DocsLightbox />
    </div>
  )
}
