export type Category = {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  accent: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  published?: boolean;
};

export let categories: Category[] = [
  { id: "math", name: "수학", description: "큰 수, 압축, 이상한 수학 실험", accent: "#8a5a44" },
  { id: "minecraft", name: "마크", description: "모드팩, 기계, 만들다 만 것들", accent: "#3d6b4e" },
  { id: "geometry-dash", name: "지메", description: "레벨과 얼티메이트 시리즈 기록", accent: "#4e6298" },
  { id: "numerical-ascension", name: "Numerical Ascension", description: "큰 수 게임 개발 노트", accent: "#7855a7" },
  { id: "misc", name: "잡글", description: "분류하기 귀찮은 생각들", accent: "#b27536" },
  { id: "large-numbers", name: "거대수", description: "엄청 큰 수를 가지고 놀기", parentId: "math", accent: "#9a6750" },
  { id: "c", name: "C", description: "C 관련 기록", parentId: "math", accent: "#9a6750" },
  { id: "spaced-out-2", name: "Spaced Out 2", description: "마크에서 살아남기", parentId: "minecraft", accent: "#4c7c5d" },
  { id: "neofactory", name: "NeoFactory", description: "기계 만들고 밸런스 부수기", parentId: "minecraft", accent: "#4c7c5d" },
  { id: "ultimate", name: "Ultimate 시리즈", description: "지메 레벨 이야기", parentId: "geometry-dash", accent: "#5f76b5" },
  { id: "development", name: "개발", description: "NA를 만드는 중", parentId: "numerical-ascension", accent: "#8864b5" },
  { id: "balance", name: "밸런스", description: "재미와 숫자 사이", parentId: "numerical-ascension", accent: "#8864b5" },
  { id: "lore", name: "로어", description: "어센디드들의 이야기", parentId: "numerical-ascension", accent: "#8864b5" },
];

export let posts: Post[] = [];

export function getCategory(id: string) { return categories.find((category) => category.id === id); }
export function getCategoryPosts(id: string) {
  const childIds = categories.filter((category) => category.parentId === id).map((category) => category.id);
  return posts.filter((post) => post.category === id || childIds.includes(post.category));
}
export function getCategoryTagCounts(id: string) {
  const counts = new Map<string, number>();
  for (const post of getCategoryPosts(id)) {
    for (const tag of new Set(post.tags.map((value) => value.trim()).filter(Boolean))) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((left, right) => left.tag.localeCompare(right.tag, "ko"));
}
export function getPostBySlug(slug: string) { return posts.find((post) => post.slug === slug); }
export function getSortedPosts(order: "newest" | "oldest" = "newest") {
  return [...posts].sort((a, b) => { const result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); return order === "newest" ? result : -result; });
}
export function getPostCategory(post: Post) { return getCategory(post.category); }
export function formatDate(date: string) {
  const value = new Date(date);
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: string) => dateParts.find((item) => item.type === type)?.value ?? "";
  const time = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(value);

  return `${part("year")}.${part("month")}.${part("day")} ${time}`;
}
export function getExcerpt(markdown: string, length = 108) {
  const plainText = markdown.replace(/```[\s\S]*?```/g, "").replace(/[#>*_`\\[\\]$]/g, "").replace(/\s+/g, " ").trim();
  return plainText.length > length ? `${plainText.slice(0, length).trim()}...` : plainText;
}

export function setContentData(next: { posts: Post[]; categories: Category[] }) {
  posts = next.posts;
  categories = next.categories;
}
