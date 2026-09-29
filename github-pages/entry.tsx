import { createRoot } from "react-dom/client";
import { SiteShell } from "@/components/site-shell";
import "@/app/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Site root element is missing.");

createRoot(rootElement).render(<SiteShell route={[]} />);
