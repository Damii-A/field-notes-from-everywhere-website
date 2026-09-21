import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleView } from "@/components/ArticleView";
import { articleMetadata, getArticleBySlug } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug("the-shortlist", slug);
  return articleMetadata(article);
}

export default async function ShortlistArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug("the-shortlist", slug);
  if (!article) notFound();

  return (
    <>
      <Header active="the-shortlist" />
      <ArticleView article={article} />
      <Footer />
    </>
  );
}
