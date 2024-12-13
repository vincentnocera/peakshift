import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";

// Types for our data structures
export interface TherapyBook {
  id: string;
  title: string;
  author: string;
  description: string;
  orderIndex: number;
  dateAdded: string;
}

export interface TherapyChapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  orderIndex: number;
  dateAdded: string;
}

export interface Concept {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  orderIndex: number;
  dateAdded: string;
}

// Book management functions
export async function createBook(
  book: Omit<TherapyBook, "id" | "dateAdded">,
): Promise<TherapyBook> {
  const id = nanoid();
  const newBook: TherapyBook = {
    ...book,
    id,
    dateAdded: new Date().toISOString(),
  };

  console.log("Creating new book:", newBook); // Debug log
  await kv.set(`book:${id}`, newBook);
  return newBook;
}

export async function getAllBooks(): Promise<TherapyBook[]> {
  // Get all keys that start with 'book:'
  const keys = await kv.keys("book:*");
  console.log("Found book keys:", keys); // Debug log

  const books = await Promise.all(keys.map((key) => kv.get(key)));
  console.log("Retrieved books:", books); // Debug log

  // Sort by orderIndex and ensure all required fields are present
  return books
    .filter((book): book is TherapyBook => {
      if (!book || typeof book !== "object") return false;
      const hasRequiredFields =
        "id" in book &&
        "title" in book &&
        "author" in book &&
        "description" in book &&
        "orderIndex" in book;
      if (!hasRequiredFields) {
        console.warn("Book missing required fields:", book);
      }
      return hasRequiredFields;
    })
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

// Chapter management functions
export async function createChapter(
  chapter: Omit<TherapyChapter, "id" | "dateAdded">,
): Promise<TherapyChapter> {
  const id = nanoid();
  const newChapter: TherapyChapter = {
    ...chapter,
    id,
    dateAdded: new Date().toISOString(),
  };

  await kv.set(`chapter:${id}`, newChapter);
  return newChapter;
}

export async function getChaptersByBookId(
  bookId: string,
): Promise<TherapyChapter[]> {
  // Get all chapters
  const keys = await kv.keys("chapter:*");
  const chapters = await Promise.all(keys.map((key) => kv.get(key)));

  // Filter by bookId and sort by orderIndex
  return chapters
    .filter(
      (chapter): chapter is TherapyChapter =>
        chapter !== null &&
        typeof chapter === "object" &&
        "bookId" in chapter &&
        chapter.bookId === bookId,
    )
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function getChapterById(
  chapterId: string,
): Promise<TherapyChapter | null> {
  return kv.get(`chapter:${chapterId}`);
}

// Delete functions
export async function deleteBook(id: string): Promise<boolean> {
  const key = id.startsWith("book:") ? id : `book:${id}`;
  console.log("Deleting book with key:", key);

  const deleted = await kv.del(key);
  console.log("Delete operation result:", deleted);
  return deleted === 1;
}

export async function deleteChapter(id: string): Promise<boolean> {
  const deleted = await kv.del(`chapter:${id}`);
  return deleted === 1;
}

// Update functions
export async function updateChapter(
  id: string,
  chapter: Partial<TherapyChapter>,
): Promise<TherapyChapter | null> {
  const existingChapter = await kv.get(`chapter:${id}`);
  if (!existingChapter) return null;

  const updatedChapter = {
    ...existingChapter,
    ...chapter,
  };
  // Type assertion to ensure updatedChapter matches TherapyChapter type
  await kv.set(`chapter:${id}`, updatedChapter as TherapyChapter);
  return updatedChapter as TherapyChapter;
}

export async function getChapter(
  chapterId: string,
): Promise<TherapyChapter | null> {
  const chapter = await kv.get(`chapter:${chapterId}`);
  if (!chapter) {
    return null;
  }
  return chapter as TherapyChapter;
}

// Concept management functions
export async function createConcept(concept: Omit<Concept, "id" | "dateAdded">): Promise<Concept> {
  const id = nanoid()
  const newConcept: Concept = {
    ...concept,
    id,
    dateAdded: new Date().toISOString()
  }

  await kv.set(`concept:${id}`, newConcept)
  return newConcept
}

export async function getConceptsByChapterId(chapterId: string): Promise<Concept[]> {
  const keys = await kv.keys("concept:*")
  const concepts = await Promise.all(keys.map(key => kv.get(key)))

  return concepts
    .filter((concept): concept is Concept =>
      concept !== null &&
      typeof concept === "object" &&
      "chapterId" in concept &&
      concept.chapterId === chapterId
    )
    .sort((a, b) => a.orderIndex - b.orderIndex)
}

export async function deleteConcept(id: string): Promise<boolean> {
  const deleted = await kv.del(`concept:${id}`)
  return deleted === 1
}
