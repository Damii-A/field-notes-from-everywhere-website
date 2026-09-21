import type { Metadata } from "next";
import { LegalPageBody } from "@/components/LegalPageBody";
import { getLegalPage } from "@/lib/content";

export const metadata: Metadata = { title: "Terms" };

export default async function TermsPage() {
  const page = await getLegalPage("terms");
  return <LegalPageBody page={page} />;
}
