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
};

export const categories: Category[] = [
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

export const posts: Post[] = [
  {
    id: "post-c8", slug: "c8-is-fun", title: "C(8) 이거 개재밌네 ㅋㅋㅋ", category: "c", tags: ["거대수", "C", "수학"],
    createdAt: "2026-09-29T14:20:00+09:00", updatedAt: "2026-09-29T14:20:00+09:00",
    content: `지피티랑 대화하면서 만들어보고 있는데 처음에는 그냥 압축 가지고 놀려고 만든 거였음. 근데 만들다 보니까 일이 존나 커짐.\n\n## 지금 생각\n\n아직 정의가 좀 덜 예쁜데 이런 식으로 커지는 건 재밌다.\n\n\\[ C(8) \\ge SSCG(3) > TREE(3) \\]`,
  },
  {
    id: "post-phobos", slug: "making-phobos", title: "포보스 만들어보고있는데", category: "minecraft", tags: ["마크", "모드팩", "포보스"],
    createdAt: "2026-09-28T19:05:00+09:00", updatedAt: "2026-09-28T19:05:00+09:00",
    content: `이거 컴퓨터처럼 생겼는데 무시하지 마셈. 아무튼 지금 밸런스 조정하는데 존나 어려움.\n\n> 기계는 많아지는데 플레이어가 행복해지는지는 모르겠음.`,
  },
  {
    id: "post-bug-calculator", slug: "big-number-calculator-bug", title: "큰 수 계산기 확장하다가 버그났다", category: "development", tags: ["Numerical Ascension", "개발", "버그"],
    createdAt: "2026-09-27T23:41:00+09:00", updatedAt: "2026-09-28T00:12:00+09:00",
    content: `아니 이거 맞냐? 3일이나 고치고 있는데 숫자가 커질수록 더 이상해짐.\n\n\`\`\`ts\nconst next = current.multiply(multiplier).normalize();\n\`\`\`\n\n일단 오늘은 여기까지.`,
  },
  {
    id: "post-ultimate-machine", slug: "ultimate-machine", title: "얼티메이트 머신 만들었는데", category: "ultimate", tags: ["지메", "얼티메이트"],
    createdAt: "2026-09-26T16:30:00+09:00", updatedAt: "2026-09-26T16:30:00+09:00",
    content: `누가 디자인해주냐 제발 아무나 지원 좀.\n\n기능은 괜찮은데 화면이 너무 공장 같음.`,
  },
  {
    id: "post-mdan", slug: "mdan-is-mid", title: "MDAN 솔직히 별로임", category: "large-numbers", tags: ["거대수", "MDAN"],
    createdAt: "2026-09-25T10:10:00+09:00", updatedAt: "2026-09-25T10:10:00+09:00",
    content: `거대수 만들려고 한건데 별로 안커짐. 처음 만들 때는 엄청 클 줄 알았는데 지금 보면 좀 애매함 ㅋㅋㅋ`,
  },
  {
    id: "post-ascended-lore", slug: "ascended-lore", title: "어센디드 로어", category: "lore", tags: ["Numerical Ascension", "로어"],
    createdAt: "2026-09-24T18:40:00+09:00", updatedAt: "2026-09-24T18:40:00+09:00",
    content: `NA에 생각해놓은 8명의 어센디드들의 설정을 정리하는 중. 아직 바뀔 수 있음.\n\n각자 숫자를 다루는 방식이 달라야 재밌을 것 같아서 계속 뜯어고치고 있다.`,
  },
  {
    id: "post-conical", slug: "conical-is-fun", title: "코니칼 재밌네", category: "geometry-dash", tags: ["지메", "레벨"],
    createdAt: "2026-09-23T13:50:00+09:00", updatedAt: "2026-09-23T13:50:00+09:00",
    content: `똥믈리에라고 하지 말고 내가 이틀만에 2분할을 해냈다는 사실에 집중해주셈.`,
  },
  {
    id: "post-wamma", slug: "wamma", title: "왐마", category: "misc", tags: ["잡글"],
    createdAt: "2026-09-22T21:15:00+09:00", updatedAt: "2026-09-22T21:15:00+09:00",
    content: `이거 보셈. 존나 큰 벌레 발견함.\n\n사진은 나중에 올릴 수도 있고 아닐 수도 있음.`,
  },
  {
    id: "post-neopack", slug: "why-i-left-neopack", title: "내가 네오팩을 버린이유", category: "neofactory", tags: ["마크", "NeoFactory"],
    createdAt: "2026-09-21T09:00:00+09:00", updatedAt: "2026-09-21T09:00:00+09:00",
    content: `뭔가 아무리 만들어도 그렉텍 느낌을 벗어나지 못해서 잠깐 멈춤. 버린 건 아니고 구석에 세워둔 상태임.`,
  },
  {
    id: "post-math-study", slug: "i-hate-studying-math", title: "나는 수학공부가 싫다", category: "math", tags: ["수학", "잡생각"],
    createdAt: "2026-09-20T12:25:00+09:00", updatedAt: "2026-09-20T12:25:00+09:00",
    content: `한국은 주입식 교육이 문제임. 내 쌤은 그래도 괜찮은데 문제를 푸는 방식이 하나뿐인 것처럼 말할 때마다 좀 답답하다.`,
  },
];

export function getCategory(id: string) { return categories.find((category) => category.id === id); }
export function getCategoryPosts(id: string) {
  const childIds = categories.filter((category) => category.parentId === id).map((category) => category.id);
  return posts.filter((post) => post.category === id || childIds.includes(post.category));
}
export function getPostBySlug(slug: string) { return posts.find((post) => post.slug === slug); }
export function getSortedPosts(order: "newest" | "oldest" = "newest") {
  return [...posts].sort((a, b) => { const result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); return order === "newest" ? result : -result; });
}
export function getPostCategory(post: Post) { return getCategory(post.category); }
export function formatDate(date: string) { return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date)).replace(/\. /g, ".").replace(/\.$/, ""); }
export function getExcerpt(markdown: string, length = 108) {
  const plainText = markdown.replace(/```[\s\S]*?```/g, "").replace(/[#>*_`\\[\\]$]/g, "").replace(/\s+/g, " ").trim();
  return plainText.length > length ? `${plainText.slice(0, length).trim()}...` : plainText;
}
