import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { validatePreviewRequest } from "@/lib/sanity/previewSecret";

/** Turns on preview (Next.js draft mode) for a Studio-issued secret only — see lib/sanity/previewSecret.ts. */
export async function GET(request: Request) {
  const { isValid, redirectTo } = await validatePreviewRequest(request.url);
  if (!isValid) {
    return new Response("Invalid or expired preview link. Open the preview from the Studio.", { status: 401 });
  }
  (await draftMode()).enable();
  redirect(redirectTo);
}
