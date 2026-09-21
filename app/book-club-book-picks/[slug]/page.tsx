import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleView } from "@/components/ArticleView";
import { getArticleBySlug } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug("book-club-book-picks", slug);
  return { title: article?.title ?? "Article not found" };
}

export default async function ClubArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug("book-club-book-picks", slug);
  if (!article) notFound();

  return (
    <>
      <Header active="book-club-book-picks" />
      <ArticleView article={article} />
      <Footer />
    </>
  );
}
