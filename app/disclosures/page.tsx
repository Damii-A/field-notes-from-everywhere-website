import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LegalPageBody } from "@/components/LegalPageBody";
import { getLegalPage } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "Disclosures", path: "/disclosures" });

export default async function DisclosuresPage() {
  const page = await getLegalPage("disclosures");
  return <LegalPageBody page={page} />;
}
