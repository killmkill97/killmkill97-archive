import { createRoot } from "react-dom/client";
import { SiteShell } from "@/components/site-shell";
import { setContentData, type Post, type Category } from "@/lib/content";
import "@/app/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Site root element is missing.");

let route: string[] = [];
const snapshot = document.getElementById("public-content");
if (snapshot?.textContent) {
  const content = JSON.parse(snapshot.textContent) as { posts: Post[]; categories: Category[]; route: string[] };
  setContentData(content);
  route = content.route;
}
createRoot(rootElement).render(<SiteShell route={route} />);
