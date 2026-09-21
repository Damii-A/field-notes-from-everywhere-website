import type { Metadata } from "next";
import { LegalPageBody } from "@/components/LegalPageBody";
import { getLegalPage } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy & Cookies" };

export default async function PrivacyPage() {
  const page = await getLegalPage("privacy-and-cookies");
  return <LegalPageBody page={page} />;
}
