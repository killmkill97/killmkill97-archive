import { env } from "cloudflare:workers";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteShell } from "@/components/site-shell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const allowedEmails = (env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  return <SiteShell route={["admin"]} adminAllowed={allowedEmails.includes(user.email.toLowerCase())} />;
}
