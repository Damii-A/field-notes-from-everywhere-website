import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryHub } from "@/components/CategoryHub";
import { getHubArticles } from "@/lib/content";

export const metadata: Metadata = { title: "Book Club Book Picks" };

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
