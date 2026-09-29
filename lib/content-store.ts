import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { categories as sampleCategories, posts as samplePosts, type Category, type Post } from "@/lib/content";

type FirestoreTimestamp = { toDate?: () => Date } | Date | string | null | undefined;

function toIso(value: FirestoreTimestamp, fallback: string) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return fallback;
}

function postFromDoc(id: string, data: Record<string, unknown>): Post {
  const createdAt = toIso(data.createdAt as FirestoreTimestamp, new Date().toISOString());
  return {
    id,
    slug: String(data.slug ?? id),
    title: String(data.title ?? "제목 없음"),
    category: String(data.category ?? "misc"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    content: String(data.content ?? ""),
    createdAt,
    updatedAt: toIso(data.updatedAt as FirestoreTimestamp, createdAt),
    coverImage: typeof data.coverImage === "string" ? data.coverImage : undefined,
    published: data.published !== false,
  };
}

function sortPosts(posts: Post[]) {
  return [...posts].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

function isAbortError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("signal is aborted") || message.includes("aborted without reason");
}

export async function loadPublishedContent() {
  let remotePosts: Post[] = [];
  let remoteCategories: Category[] = [];
  let connected = true;

  try {
    // Sort in the browser so this only needs Firestore's simple published index.
    // It also avoids a composite-index request for published + createdAt.
    const postSnapshot = await getDocs(query(collection(firestore, "posts"), where("published", "==", true)));
    remotePosts = sortPosts(postSnapshot.docs.map((item) => postFromDoc(item.id, item.data())));
  } catch (error) {
    connected = false;
    if (!isAbortError(error)) console.warn("Firestore public posts unavailable; using sample posts.", error);
  }

  try {
    const categorySnapshot = await getDocs(collection(firestore, "categories"));
    remoteCategories = categorySnapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as Category))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    connected = false;
    if (!isAbortError(error)) console.warn("Firestore categories unavailable; using sample categories.", error);
  }

  return { posts: remotePosts.length ? remotePosts : samplePosts, categories: remoteCategories.length ? remoteCategories : sampleCategories, connected };
}

export async function getAdminStatus(uid: string) {
  const snapshot = await getDoc(doc(firestore, "admins", uid));
  return snapshot.exists() && snapshot.data().enabled === true;
}

export async function loadAdminPosts() {
  const snapshot = await getDocs(collection(firestore, "posts"));
  return sortPosts(snapshot.docs.map((item) => postFromDoc(item.id, item.data())));
}

export async function savePost(input: Omit<Post, "id" | "createdAt" | "updatedAt">) {
  const reference = await addDoc(collection(firestore, "posts"), { ...input, published: input.published !== false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return reference.id;
}

export async function updatePost(id: string, input: Partial<Omit<Post, "id" | "createdAt" | "updatedAt">>) {
  await updateDoc(doc(firestore, "posts", id), { ...input, updatedAt: serverTimestamp() });
}

export async function removePost(id: string) {
  await deleteDoc(doc(firestore, "posts", id));
}
