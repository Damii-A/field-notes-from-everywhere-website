import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LegalPageBody } from "@/components/LegalPageBody";
import { getLegalPage } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "Terms", path: "/terms" });

export default async function TermsPage() {
  const page = await getLegalPage("terms");
  return <LegalPageBody page={page} />;
}
