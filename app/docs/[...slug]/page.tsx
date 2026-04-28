import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import { getDocBySlug, extractTOC } from '@/lib/docs'
import Callout from '@/components/docs/Callout'
import Frame from '@/components/docs/Frame'
import CodeBlock from '@/components/docs/CodeBlock'
import DocsTOC from '@/components/docs/DocsTOC'

interface Props {
  params: Promise<{ slug: string[] }>
}

const components = { Callout, Frame, pre: CodeBlock }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = getDocBySlug(slug)
  if (!doc) return {}
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  }
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params
  const doc = getDocBySlug(slug)

  if (!doc) notFound()

  const toc = extractTOC(doc.content)

  return (
    <>
      <article className="docs-article">
        <header className="docs-article-header">
          <h1 className="docs-article-title">{doc.frontmatter.title}</h1>
          {doc.frontmatter.description && (
            <p className="docs-article-desc">{doc.frontmatter.description}</p>
          )}
        </header>
        <div className="docs-prose">
          <MDXRemote
            source={doc.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                  [rehypePrettyCode, { theme: 'github-dark' }],
                ],
              },
            }}
            components={components}
          />
        </div>
        <p className="docs-article-updated">
          Last updated{' '}
          {doc.lastUpdated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </article>
      <DocsTOC items={toc} />
    </>
  )
}
