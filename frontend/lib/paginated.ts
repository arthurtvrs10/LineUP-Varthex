import { apiFetch } from "./api";

type Page<T> = { items: T[]; page: { totalPages: number } };

export async function fetchAllPages<T>(path: string): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const items: T[] = [];
  let page = 0;
  let totalPages = 1;
  do {
    const response = await apiFetch<Page<T>>(`${path}${separator}page=${page}&size=100`);
    items.push(...response.items);
    totalPages = response.page.totalPages;
    page += 1;
  } while (page < totalPages);
  return items;
}
