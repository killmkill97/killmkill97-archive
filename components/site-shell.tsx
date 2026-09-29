"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { categories, formatDate, getCategory, getCategoryPosts, getExcerpt, getPostBySlug, getPostCategory, getSortedPosts, setContentData, type Post } from "@/lib/content";
import { firebaseAuth } from "@/lib/firebase";
import { getAdminStatus, loadAdminPosts, loadPublishedContent, removePost, savePost, updatePost } from "@/lib/content-store";
import { loadMathJax } from "@/components/mathjax-loader";

type SiteShellProps = { route: string[] };
const SITE_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
const navItems = [{ href: "/", label: "홈" }, { href: "/all", label: "모든 글" }, { href: "/toc", label: "목차" }, { href: "/about", label: "소개" }];

export function SiteShell({ route }: SiteShellProps) {
  const [dark, setDark] = useState(false);
  const [activeRoute, setActiveRoute] = useState(route);
  const [, setContentVersion] = useState(0);

  useEffect(() => {
    function syncRoute() {
      const current = new URL(window.location.href);
      const requestedRoute = current.searchParams.get("__gh_route");

      if (requestedRoute) {
        const target = new URL(requestedRoute, window.location.origin);
        if (target.origin !== window.location.origin) return;
        window.history.replaceState(null, "", `${target.pathname}${target.search}${target.hash}`);
        setActiveRoute(routeFromPath(target.pathname));
        return;
      }

      setActiveRoute(routeFromPath(current.pathname));
    }

    syncRoute();
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("killmkill97-theme");
    setDark(stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("killmkill97-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    let active = true;
    void loadPublishedContent()
      .then((content) => {
        if (!active) return;
        setContentData(content);
        setContentVersion((version) => version + 1);
      })
      .catch(() => {
        // Firestore requests can be cancelled during navigation or dev HMR.
        // The store already provides sample content, so the page can remain usable.
      });
    return () => { active = false; };
  }, []);

  return <div className="site-frame"><Header dark={dark} onToggleTheme={() => setDark((value) => !value)} /><main className="site-main"><div className="archive-rule" aria-hidden="true" />{activeRoute.length === 0 ? <HomePage /> : null}{activeRoute[0] === "all" ? <AllPostsPage /> : null}{activeRoute[0] === "toc" ? <TocPage /> : null}{activeRoute[0] === "about" ? <AboutPage /> : null}{activeRoute[0] === "category" && activeRoute[1] ? <CategoryPage categoryId={activeRoute[1]} /> : null}{activeRoute[0] === "post" && activeRoute[1] ? <PostPage slug={activeRoute[1]} /> : null}{activeRoute[0] === "admin" ? <AdminEditor /> : null}{!isKnownRoute(activeRoute) ? <NotFoundPage /> : null}</main><footer className="site-footer"><span>killmkill97의 개인 사이트</span><span>그냥 내가 만든 거랑 생각난 거 올리는 곳</span></footer></div>;
}

function isKnownRoute(route: string[]) { if (route.length === 0) return true; if (["all", "toc", "about", "admin"].includes(route[0])) return route.length === 1; if (["category", "post"].includes(route[0])) return Boolean(route[1]) && route.length === 2; return false; }
function routeFromPath(pathname: string) {
  const path = SITE_BASE_PATH && (pathname === SITE_BASE_PATH || pathname === `${SITE_BASE_PATH}/`)
    ? "/"
    : SITE_BASE_PATH && pathname.startsWith(`${SITE_BASE_PATH}/`)
      ? pathname.slice(SITE_BASE_PATH.length)
      : pathname;
  return path.split("/").filter(Boolean).map((part) => {
    try { return decodeURIComponent(part); } catch { return part; }
  });
}

function Link({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const destination = href.startsWith("/") ? `${SITE_BASE_PATH}${href}` : href;
  return <a href={destination} {...props} />;
}

function Header({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) { return <header className="site-header"><Link className="brand" href="/" aria-label="killmkill97 홈"><span className="brand-mark" aria-hidden="true">k/</span><span>killmkill97</span></Link><nav className="top-nav" aria-label="주요 메뉴">{navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav><button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={dark ? "라이트 모드로 바꾸기" : "다크 모드로 바꾸기"}><span aria-hidden="true">{dark ? "☼" : "☾"}</span><span className="theme-label">{dark ? "밝게" : "어둡게"}</span></button></header>; }

function HomePage() { const recent = getSortedPosts().slice(0, 6); const categoryCount = categories.filter((category) => !category.parentId).length; return <div className="page-stack home-page"><section className="intro-block"><p className="eyebrow">PERSONAL ARCHIVE / 2026—</p><h1>killmkill97의<br /><em>개인 사이트</em></h1><p className="intro-copy">수학도 하고, 마크도 하고, 게임도 만들고, 가끔은 그냥 이상한 걸 발견함.</p><div className="intro-meta"><span>posts {getSortedPosts().length}</span><span>categories {categoryCount}</span><span>last updated {recent[0] ? formatDate(recent[0].updatedAt) : "—"}</span></div></section><section className="section-block"><div className="section-heading"><div><p className="eyebrow">RECENTLY WRITTEN</p><h2>최근 글</h2></div><Link className="text-link" href="/all">모든 글 보기 <span>↗</span></Link></div><div className="post-list">{recent.length ? recent.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState text="아직 공개된 글이 없음. 첫 글을 관리자에서 작성해보셈." />}</div></section><section className="home-scrap"><span className="scrap-label">메모</span><p>이번 주엔 또 뭘 만들지 모르겠음. 일단 기록은 해두자.</p><span className="scrap-mark">*</span></section></div>; }
function AllPostsPage() { const [queryText, setQueryText] = useState(""); const [order, setOrder] = useState<"newest" | "oldest">("newest"); const listedPosts = useMemo(() => { const normalized = queryText.toLowerCase().trim(); return getSortedPosts(order).filter((post) => !normalized || `${post.title} ${post.content} ${post.tags.join(" ")}`.toLowerCase().includes(normalized)); }, [order, queryText]); return <div className="page-stack"><PageIntro eyebrow="ALL POSTS" title="모든 글" copy="분류 상관없이 적어둔 것들을 시간순으로 모아봄." /><div className="list-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="제목이나 내용 검색" aria-label="제목이나 내용 검색" /></label><select value={order} onChange={(event) => setOrder(event.target.value as "newest" | "oldest")} aria-label="정렬 순서"><option value="newest">최신순</option><option value="oldest">오래된순</option></select></div><p className="result-count">{listedPosts.length}개의 글{queryText ? ` · '${queryText}' 검색 결과` : ""}</p><div className="post-list">{listedPosts.length ? listedPosts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState text={queryText ? "검색 결과가 없음. 다른 단어로 찾아보셈." : "아직 공개된 글이 없음."} />}</div></div>; }
function TocPage() { const roots = categories.filter((category) => !category.parentId); return <div className="page-stack"><PageIntro eyebrow="TABLE OF CONTENTS" title="목차" copy="분류는 나중에 마음대로 바꿀 수 있게 데이터로 관리 중." /><div className="toc-grid">{roots.map((category) => { const children = categories.filter((item) => item.parentId === category.id); return <section className="toc-group" key={category.id}><Link href={`/category/${category.id}`} className="toc-root"><span className="category-dot" style={{ backgroundColor: category.accent }} />{category.name}<span className="toc-arrow">↗</span></Link><p>{category.description}</p>{children.length ? <ul>{children.map((child) => <li key={child.id}><Link href={`/category/${child.id}`}>{child.name}<span>{getCategoryPosts(child.id).length}</span></Link></li>)}</ul> : <span className="toc-empty">아직 하위 분류 없음</span>}</section>; })}</div></div>; }
function CategoryPage({ categoryId }: { categoryId: string }) { const category = getCategory(categoryId); const categoryPosts = category ? getSortedPosts().filter((post) => getCategoryPosts(category.id).some((item) => item.id === post.id)) : []; if (!category) return <NotFoundPage />; return <div className="page-stack"><PageIntro eyebrow="CATEGORY" title={category.name} copy={category.description} /><div className="category-toolbar"><Link className="back-link" href="/toc">← 목차로</Link><span>{categoryPosts.length}개의 글</span></div><div className="post-list">{categoryPosts.length ? categoryPosts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState text="아직 이 분류에 적어둔 글이 없음." />}</div></div>; }
function PostPage({ slug }: { slug: string }) { const post = getPostBySlug(slug); if (!post) return <NotFoundPage />; const category = getPostCategory(post); const sorted = getSortedPosts(); const index = sorted.findIndex((item) => item.id === post.id); return <article className="post-page"><div className="post-breadcrumb"><Link href="/">홈</Link><span>›</span><Link href={`/category/${category?.id ?? post.category}`}>{category?.name ?? post.category}</Link><span>›</span><span>{post.tags[0]}</span></div><header className="post-header"><p className="eyebrow">{formatDate(post.createdAt)} · {category?.name}</p><h1>{post.title}</h1><div className="tag-row">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></header><div className="post-divider" /><MarkdownContent source={post.content} />{post.coverImage ? <img className="post-cover" src={post.coverImage} alt="" /> : null}<div className="post-footer-note">댓글로 의견 남겨주세요. <small>(진짜 댓글창은 아직 없음)</small></div><div className="post-navigation"><PostNavLink label="이전 글" post={sorted[index + 1]} direction="left" /><PostNavLink label="다음 글" post={sorted[index - 1]} direction="right" /></div></article>; }
function PostNavLink({ label, post, direction }: { label: string; post?: Post; direction: "left" | "right" }) { return post ? <Link className={`post-nav-link ${direction}`} href={`/post/${post.slug}`}><span>{direction === "left" ? "←" : "→"}</span><small>{label}</small><strong>{post.title}</strong></Link> : <span className="post-nav-link disabled"><span>{direction === "left" ? "←" : "→"}</span><small>{label}</small><strong>없음</strong></span>; }
function AboutPage() { return <div className="page-stack about-page"><PageIntro eyebrow="ABOUT THIS PLACE" title="소개" copy="대단한 포트폴리오는 아니고, 그냥 뭔가를 만들면서 남겨두는 개인 홈페이지." /><div className="about-grid"><div><p>사이트 주인은 <strong>killmkill97</strong>임.</p><p>수학, 마인크래프트, 지메, Numerical Ascension 같은 걸 건드리고 있음. 완성된 결과보다 만들다가 생긴 생각이나 실패한 것도 여기에 적어둘 예정.</p></div><dl><div><dt>여기서 하는 일</dt><dd>만들기 · 기록하기 · 다시 뜯어고치기</dd></div><div><dt>글 쓰는 방식</dt><dd>Markdown 기반, 편한 말투</dd></div><div><dt>댓글</dt><dd>아직 없음. 의견은 어딘가로 보내주셈</dd></div></dl></div><Link className="text-link" href="/all">글 보러 가기 <span>↗</span></Link></div>; }

type EditorForm = { id?: string; title: string; slug: string; category: string; tags: string; content: string; coverImage: string; published: boolean };
const emptyEditor: EditorForm = { title: "", slug: "", category: "math", tags: "", content: "", coverImage: "", published: true };

function AdminEditor() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<EditorForm>(emptyEditor);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(firebaseAuth, (currentUser) => { setUser(currentUser); setAuthReady(true); if (!currentUser) setAdmin(null); }), []);
  useEffect(() => {
    if (!user) return;
    let active = true;
    getAdminStatus(user.uid).then((allowed) => { if (active) setAdmin(allowed); }).catch(() => { if (active) { setAdmin(false); setMessage("Firebase Security Rules가 아직 적용되지 않았거나 관리자 문서를 읽을 수 없음."); } });
    return () => { active = false; };
  }, [user]);
  useEffect(() => { if (admin) void refreshAdminPosts(); }, [admin]);

  async function refreshAdminPosts() { try { setAdminPosts(await loadAdminPosts()); } catch { setMessage("글 목록을 불러오지 못했음. Firestore Rules와 관리자 권한을 확인해보셈."); } }
  async function login() { setMessage(""); try { await signInWithPopup(firebaseAuth, new GoogleAuthProvider()); } catch (error) { setMessage(error instanceof Error ? error.message : "Google 로그인에 실패했음."); } }
  async function logout() { try { await signOut(firebaseAuth); } catch (error) { setMessage(error instanceof Error ? error.message : "로그아웃에 실패했음."); } }
  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) { setMessage("제목, slug, 본문은 꼭 적어야 함."); return; }
    setBusy(true); setMessage("");
    const input = { title: form.title.trim(), slug: form.slug.trim(), category: form.category, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean), content: form.content, coverImage: form.coverImage.trim(), published: form.published };
    try { if (form.id) await updatePost(form.id, input); else await savePost(input); setForm({ ...emptyEditor, category: form.category }); await refreshAdminPosts(); const content = await loadPublishedContent(); setContentData(content); setMessage(form.id ? "수정 저장했음." : "새 글을 게시했음."); } catch (error) { setMessage(error instanceof Error ? error.message : "저장에 실패했음."); } finally { setBusy(false); }
  }
  async function deletePost(id: string) { if (!window.confirm("이 글을 삭제할까?")) return; setBusy(true); try { await removePost(id); await refreshAdminPosts(); setMessage("삭제했음."); } catch { setMessage("삭제에 실패했음."); } finally { setBusy(false); } }
  function editPost(post: Post) { setForm({ id: post.id, title: post.title, slug: post.slug, category: post.category, tags: post.tags.join(", "), content: post.content, coverImage: post.coverImage ?? "", published: post.published !== false }); setPreview(false); window.scrollTo({ top: 0, behavior: "smooth" }); }

  if (!authReady) return <div className="page-stack"><PageIntro eyebrow="PRIVATE AREA" title="관리자" copy="로그인 상태를 확인하는 중..." /></div>;
  if (!user) return <div className="page-stack"><PageIntro eyebrow="PRIVATE AREA" title="관리자" copy="내 글을 쓰고 관리하는 공간." /><div className="admin-box"><span className="status-stamp">FIREBASE AUTH</span><h2>Google 계정으로 로그인</h2><p>방문자는 글을 읽을 수 있고, 관리자 권한이 확인된 계정만 글을 저장할 수 있음.</p><button className="button-link" type="button" onClick={login}>Google로 로그인</button></div></div>;
  if (admin === null) return <div className="page-stack"><PageIntro eyebrow="PRIVATE AREA" title="관리자 확인 중" copy="Firestore에서 관리자 권한을 확인하는 중..." /></div>;
  if (!admin) return <div className="page-stack"><PageIntro eyebrow="PRIVATE AREA" title="관리자 권한이 없음" copy="로그인은 됐지만 이 계정에는 관리자 권한이 아직 없음." /><div className="admin-box"><p>Firebase Console에서 `admins` 컬렉션을 만들고, 아래 UID를 문서 ID로 사용해 주세요.</p><code className="uid-box">{user.uid}</code><p>문서 필드: `enabled: true`</p><button className="button-link muted-button" type="button" onClick={() => void logout()}>로그아웃</button></div>{message ? <p className="admin-footnote">{message}</p> : null}</div>;
  return <div className="page-stack admin-placeholder"><PageIntro eyebrow="PRIVATE AREA" title={form.id ? "글 수정" : "새 글 쓰기"} copy="Firestore에 바로 저장되는 Markdown 글 작성기." /><form className="admin-editor" onSubmit={submitPost}><label>제목<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="예: 이거 만들다가 또 망함" /></label><div className="admin-editor-row"><label>slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="my-new-post" /></label><label>카테고리<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><label>태그<input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="거대수, C, 생각" /></label><label>대표 이미지 URL<input value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} placeholder="선택 사항" /></label><label>본문<textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="# 제목\n\n마크다운으로 편하게 작성하면 됨." rows={14} /></label><label className="published-toggle"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> 공개 게시</label><div className="admin-actions"><button className="button-link" type="button" onClick={() => setPreview((value) => !value)}>{preview ? "작성으로 돌아가기" : "미리보기"}</button><button className="button-link" type="submit" disabled={busy}>{busy ? "저장 중..." : form.id ? "수정 저장" : "게시"}</button>{form.id ? <button className="button-link muted-button" type="button" onClick={() => setForm({ ...emptyEditor, category: form.category })}>새 글</button> : null}<button className="button-link muted-button" type="button" onClick={() => void logout()}>로그아웃</button></div></form>{preview ? <div className="admin-live-preview"><p className="eyebrow">PREVIEW</p><h2>{form.title || "제목 없음"}</h2><MarkdownContent source={form.content || "본문을 적으면 여기에 미리보기가 나옴."} /></div> : null}<section className="admin-posts"><div className="section-heading"><div><p className="eyebrow">FIRESTORE POSTS</p><h2>기존 글</h2></div><span className="result-count">{adminPosts.length}개</span></div>{adminPosts.length ? adminPosts.map((post) => <div className="admin-post-row" key={post.id}><div><strong>{post.title}</strong><small>{formatDate(post.createdAt)} · {post.published === false ? "비공개" : "공개"}</small></div><div><button type="button" onClick={() => editPost(post)}>수정</button><button type="button" onClick={() => void deletePost(post.id)}>삭제</button></div></div>) : <EmptyState text="아직 Firestore에 글이 없음." />}</section>{message ? <p className="admin-footnote">{message}</p> : null}</div>;
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></header>; }
function PostCard({ post }: { post: Post }) { const category = getPostCategory(post); return <Link className="post-card" href={`/post/${post.slug}`}><div className="post-card-top"><span className="category-label"><i style={{ backgroundColor: category?.accent }} />{category?.name ?? post.category}</span><time>{formatDate(post.createdAt)}</time></div><h3>{post.title}</h3><p>{getExcerpt(post.content)}</p><div className="post-card-bottom"><span>{post.tags.slice(0, 2).map((tag) => `#${tag}`).join(" ")}</span><span className="card-arrow">↗</span></div></Link>; }
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><span>∅</span><p>{text}</p></div>; }
function NotFoundPage() { return <div className="page-stack not-found"><p className="eyebrow">404 / NOTHING HERE</p><h1>이 페이지는 아직 안 만듦.</h1><Link className="button-link" href="/">홈으로</Link></div>; }

function MarkdownContent({ source }: { source: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    let cancelled = false;
    if (!element) return;

    void loadMathJax()
      .then((mathJax) => {
        if (cancelled) return;
        return mathJax.typesetPromise?.([element]);
      })
      .catch((error: unknown) => {
        console.error("Could not render math in this post.", error);
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  const blocks = splitMarkdownBlocks(source);
  return <div ref={contentRef} className="markdown-content">{blocks.map((block, index) => {
    const key = `${index}-${block.slice(0, 12)}`;
    if (block.startsWith("```")) {
      const lines = block.split("\n");
      return <pre key={key} data-language={lines[0].replace("```", "").trim()}><code>{lines.slice(1, -1).join("\n")}</code></pre>;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(block)) return <hr className="markdown-rule" key={key} />;
    if (/^#{1,3} /.test(block)) {
      const level = block.match(/^#+/)?.[0].length ?? 2;
      const text = block.replace(/^#{1,3} /, "");
      return level === 1 ? <h2 key={key}>{renderInline(text)}</h2> : <h3 key={key}>{renderInline(text)}</h3>;
    }
    if (/^> /.test(block)) return <blockquote key={key}>{renderInline(block.replace(/^> /, ""))}</blockquote>;
    if (/^(?:- |\* )/.test(block)) return <ul key={key}>{block.split("\n").map((line) => <li key={line}>{renderInline(line.replace(/^(?:- |\* )/, ""))}</li>)}</ul>;
    if (block.startsWith("\\[") || block.startsWith("$$")) return <div className="math-block" key={key}>{block}</div>;
    if (/^!\[.*\]\(.*\)$/.test(block)) {
      const match = block.match(/^!\[(.*)\]\((.*)\)$/);
      return match ? <figure key={key}><img src={match[2]} alt={match[1]} /><figcaption>{match[1]}</figcaption></figure> : null;
    }
    return <p key={key}>{block.split("\n").map((line, lineIndex) => <span key={`${key}-${lineIndex}`}>{lineIndex ? <br /> : null}{renderInline(line)}</span>)}</p>;
  })}</div>;
}

function splitMarkdownBlocks(source: string) {
  const blocks: string[] = [];
  let lines: string[] = [];
  let inCodeBlock = false;
  const flush = () => {
    if (lines.length) blocks.push(lines.join("\n"));
    lines = [];
  };

  for (const line of source.trim().split("\n")) {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        lines.push(line);
        flush();
        inCodeBlock = false;
      } else {
        flush();
        lines.push(line);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      lines.push(line);
    } else if (/^\s*$/.test(line)) {
      flush();
    } else if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flush();
      blocks.push(line.trim());
    } else {
      lines.push(line);
    }
  }

  flush();
  return blocks;
}

function renderInline(text: string) { const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^\)]+\)|\\\([^\)]+\\\)|\$[^$]+\$)/g).filter(Boolean); return tokens.map((token, index) => { const key = `${token}-${index}`; if (token.startsWith("**") && token.endsWith("**")) return <strong key={key}>{token.slice(2, -2)}</strong>; if (token.startsWith("`") && token.endsWith("`")) return <code key={key}>{token.slice(1, -1)}</code>; const link = token.match(/^\[([^\]]+)\]\(([^\)]+)\)$/); if (link) return <a key={key} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>; if (token.startsWith("\\(") || token.startsWith("$")) return <span className="math-inline" key={key}>{token}</span>; return <span key={key}>{token}</span>; }); }
