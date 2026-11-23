import { build } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
process.chdir(projectRoot);
process.env.GITHUB_PAGES = "true";
await build();
const rendererDir = resolve(projectRoot, "dist/prerender");
await build({ build: { ssr: resolve(projectRoot, "github-pages/prerender.tsx"), outDir: rendererDir } });
const { readPublicContent, renderPage } = await import(pathToFileURL(resolve(rendererDir, "prerender.js")).href);
const content = await readPublicContent();
const output = resolve(projectRoot, "dist/github-pages");
const template = await readFile(resolve(output, "index.html"), "utf8");
const siteUrl = "https://killmkill97.github.io/killmkill97-archive/";
const siteTitle = "killmkill97의 개인 사이트";
const description = "그냥 이상한 사람임. 나를 다른걸로 정의하는것보다는 나는 나라고하는게 정확할거임";
const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const routes = [
  { route: [], title: siteTitle, description },
  { route: ["all"], title: `모든 글 · ${siteTitle}`, description: "공개된 글을 최신순으로 모아둔 아카이브." },
  { route: ["toc"], title: `목차 · ${siteTitle}`, description: "카테고리와 태그별 글 목차." },
  { route: ["about"], title: `소개 · ${siteTitle}`, description },
  { route: ["admin"], title: `관리자 · ${siteTitle}`, description: "글 관리", noindex: true },
  ...content.categories.map((category) => ({ route: ["category", category.id], title: `${category.name} · ${siteTitle}`, description: category.description })),
  ...content.posts.map((post) => ({ route: ["post", post.slug], title: `${post.title} · ${siteTitle}`, description: post.content.replace(/[#*`\\$]/g, "").replace(/\s+/g, " ").slice(0, 160), post })),
];
const usedRoutes = new Set();
const sitemap = [];
for (const page of routes) {
  for (const segment of page.route) {
    if (!segment || segment === "." || segment === ".." || /[/\\?#%\x00-\x1f]/.test(segment)) throw new Error("Invalid public URL segment; check category IDs and post slugs.");
  }
  const routePath = page.route.join("/");
  if (usedRoutes.has(routePath)) throw new Error(`Duplicate public URL: ${routePath}`);
  usedRoutes.add(routePath);
  const url = siteUrl + page.route.map(encodeURIComponent).join("/") + (page.route.length ? "/" : "");
  let head = `<link rel="canonical" href="${escape(url)}" />\n<meta name="robots" content="${page.noindex ? "noindex,follow" : "index,follow"}" />\n<link rel="sitemap" type="application/xml" href="${siteUrl}sitemap.xml" />\n<meta property="og:site_name" content="${siteTitle}" />\n<meta property="og:locale" content="ko_KR" />\n<meta property="og:title" content="${escape(page.title)}" />\n<meta property="og:description" content="${escape(page.description)}" />\n<meta property="og:url" content="${escape(url)}" />\n<meta property="og:type" content="${page.post ? "article" : "website"}" />\n`;
  if (page.post) {
    head += `<script type="application/ld+json">${json({ "@context": "https://schema.org", "@type": "BlogPosting", headline: page.post.title, description: page.description, datePublished: page.post.createdAt, dateModified: page.post.updatedAt, author: { "@type": "Person", name: "killmkill97", url: siteUrl }, mainEntityOfPage: url, ...(page.post.coverImage ? { image: page.post.coverImage } : {}) })}</script>\n`;
  }
  const rendered = renderPage(page.route, content);
  let html = template.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escape(page.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escape(page.description)}" />`)
    .replace("</head>", () => `${head}</head>`)
    .replace('<div id="root"><p>페이지를 불러오는 중...</p></div>', () => `<div id="root">${rendered}</div><script id="public-content" type="application/json">${json({ ...content, route: page.route })}</script>`);
  if (!html.includes('id="public-content"')) throw new Error("Could not insert static content into the HTML template.");
  const target = resolve(output, ...page.route, "index.html");
  if (!target.startsWith(output + sep)) throw new Error("Static output path escaped the build directory.");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
  if (!page.noindex) sitemap.push(`<url><loc>${escape(url)}</loc>${page.post ? `<lastmod>${escape(page.post.updatedAt)}</lastmod>` : ""}</url>`);
}
await writeFile(resolve(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.join("\n")}</urlset>`);
// A project-level robots.txt is informational; crawlers consult the host-root file.
await writeFile(resolve(output, "robots.txt"), `User-agent: *\nAllow: /killmkill97-archive/\nSitemap: ${siteUrl}sitemap.xml\n`);
console.log(`Generated ${routes.length} HTML pages, including ${content.posts.length} public posts, and sitemap.xml.`);
// All output writes are awaited; close build-tool background handles for CI.
process.exit(0);
