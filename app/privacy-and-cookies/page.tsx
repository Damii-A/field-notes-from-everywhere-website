import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LegalPageBody } from "@/components/LegalPageBody";
import { getLegalPage } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "Privacy & Cookies", path: "/privacy-and-cookies" });

export default async function PrivacyPage() {
  const page = await getLegalPage("privacy-and-cookies");
  return <LegalPageBody page={page} />;
}
