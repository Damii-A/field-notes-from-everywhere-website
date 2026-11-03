import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryHub } from "@/components/CategoryHub";
import { CATEGORIES, getHubArticles } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "Up Next", description: CATEGORIES["up-next"].description, path: "/up-next" });

export default async function UpNextHub() {
  const hub = await getHubArticles("up-next");
  return (
    <>
      <Header active="up-next" />
      <CategoryHub category="up-next" hub={hub} />
      <Footer />
    </>
  );
}
