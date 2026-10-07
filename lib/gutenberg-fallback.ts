export type FallbackBook = {
  id: number;
  title: string;
  authors: string[];
};

// A small offline search list for when the live Gutenberg catalog is unreachable.
export const fallbackBooks: FallbackBook[] = [
  { id: 11, title: "Alice’s Adventures in Wonderland", authors: ["Lewis Carroll"] },
  { id: 84, title: "Frankenstein", authors: ["Mary Wollstonecraft Shelley"] },
  { id: 98, title: "A Tale of Two Cities", authors: ["Charles Dickens"] },
  { id: 345, title: "Dracula", authors: ["Bram Stoker"] },
  { id: 514, title: "Little Women", authors: ["Louisa May Alcott"] },
  { id: 55, title: "The Wonderful Wizard of Oz", authors: ["L. Frank Baum"] },
  { id: 74, title: "The Adventures of Tom Sawyer", authors: ["Mark Twain"] },
  { id: 120, title: "Robinson Crusoe", authors: ["Daniel Defoe"] },
  { id: 1342, title: "Pride and Prejudice", authors: ["Jane Austen"] },
  { id: 1661, title: "The Adventures of Sherlock Holmes", authors: ["Arthur Conan Doyle"] },
  { id: 2701, title: "Moby-Dick", authors: ["Herman Melville"] },
  { id: 1260, title: "Jane Eyre", authors: ["Charlotte Brontë"] },
];

export function findFallbackBooks(query: string) {
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return fallbackBooks.filter((book) => {
    const searchable = `${book.title} ${book.authors.join(" ")}`.toLocaleLowerCase();
    return terms.every((term) => searchable.includes(term));
  }).slice(0, 12);
}
