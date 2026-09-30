import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryHub } from "@/components/CategoryHub";
import { CATEGORIES, getHubArticles } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "Book Club Book Picks", description: CATEGORIES["book-club-book-picks"].description, path: "/book-club-book-picks" });

export default async function BookClubBookPicksHub() {
  const hub = await getHubArticles("book-club-book-picks");
  return (
    <>
      <Header active="book-club-book-picks" />
      <CategoryHub category="book-club-book-picks" hub={hub} />
      <Footer />
    </>
  );
}
