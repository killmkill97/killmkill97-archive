import { SiteShell } from "@/components/site-shell";

export default async function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  return <SiteShell route={resolvedParams.slug ?? []} />;
}
