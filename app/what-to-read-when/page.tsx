import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryHub } from "@/components/CategoryHub";
import { CATEGORIES, getHubArticles } from "@/lib/content";

export const metadata: Metadata = { title: "What to Read When", description: CATEGORIES["what-to-read-when"].description };

export default async function WhatToReadWhenHub() {
  const hub = await getHubArticles("what-to-read-when");
  return (
    <>
      <Header active="what-to-read-when" />
      <CategoryHub category="what-to-read-when" hub={hub} />
      <Footer />
    </>
  );
}
