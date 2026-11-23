import { renderToString } from "react-dom/server";
import { deleteApp } from "firebase/app";
import { collection, getDocs, query, where, terminate } from "firebase/firestore";
import { SiteShell } from "@/components/site-shell";
import { firestore, firebaseApp } from "@/lib/firebase";
import { categories, setContentData, type Post, type Category } from "@/lib/content";

export async function readPublicContent() {
  try {
    // Use the same public query and Security Rules as a signed-out visitor.
    // Fail the build on a read error rather than publishing an empty archive.
    const snapshot = await getDocs(query(collection(firestore, "posts"), where("published", "==", true)));
    const timestamp = (value: unknown) => {
      if (typeof value === "string") return value;
      if (value && typeof value === "object" && "toDate" in value) return (value as { toDate: () => Date }).toDate().toISOString();
      throw new Error("A public post is missing its publication timestamp.");
    };
    const publicPosts: Post[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, slug: String(data.slug ?? doc.id), title: String(data.title ?? "제목 없음"),
        category: String(data.category ?? "misc"), tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        content: String(data.content ?? ""), createdAt: timestamp(data.createdAt),
        updatedAt: timestamp(data.updatedAt ?? data.createdAt), published: true,
        ...(typeof data.coverImage === "string" ? { coverImage: data.coverImage } : {}),
      };
    });
    const categorySnapshot = await getDocs(collection(firestore, "categories"));
    const publicCategories = categorySnapshot.empty ? categories : categorySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Category);
    return { posts: publicPosts, categories: publicCategories };
  } finally {
    await terminate(firestore);
    await deleteApp(firebaseApp);
  }
}

export function renderPage(route: string[], content: { posts: Post[]; categories: Category[] }) {
  setContentData(content);
  return renderToString(<SiteShell route={route} />);
}
