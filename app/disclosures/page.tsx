import type { Metadata } from "next";
import { LegalPageBody } from "@/components/LegalPageBody";
import { getLegalPage } from "@/lib/content";

export const metadata: Metadata = { title: "Disclosures" };

export default async function DisclosuresPage() {
  const page = await getLegalPage("disclosures");
  return <LegalPageBody page={page} />;
}
