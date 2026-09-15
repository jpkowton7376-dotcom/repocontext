import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BLOG_POSTS, getPost } from "@/lib/blog-data"
import { SITE_URL } from "@/lib/site-url"

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — RepoContext`,
    description: post.excerpt,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
      languages: {
        en: `${SITE_URL}/blog/${post.slug}`,
        "zh-Hant": `${SITE_URL}/blog/${post.slug}`,
        "x-default": `${SITE_URL}/blog/${post.slug}`,
      },
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return <BlogPostClient post={post} />
}
