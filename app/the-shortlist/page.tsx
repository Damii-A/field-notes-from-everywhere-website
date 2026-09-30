import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryHub } from "@/components/CategoryHub";
import { CATEGORIES, getHubArticles } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "The Shortlist", description: CATEGORIES["the-shortlist"].description, path: "/the-shortlist" });

export default async function TheShortlistHub() {
  const hub = await getHubArticles("the-shortlist");
  return (
    <>
      <Header active="the-shortlist" />
      <CategoryHub category="the-shortlist" hub={hub} />
      <Footer />
    </>
  );
}
