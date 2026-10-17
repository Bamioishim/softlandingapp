// Client-side Wikipedia page-image lookup for neighborhood photos.
// Results are cached per title so repeat renders never refetch.
const cache = new Map<string, string | null>();

export async function wikipediaImage(title: string): Promise<string | null> {
  if (cache.has(title)) return cache.get(title) ?? null;
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=original%7Cthumbnail&pithumbsize=800&titles=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Wikipedia request failed");
    const data = await res.json();
    const pages = (data?.query?.pages ?? {}) as Record<string, { original?: { source?: string }; thumbnail?: { source?: string } }>;
    const page = Object.values(pages)[0];
    const src = page?.original?.source ?? page?.thumbnail?.source ?? null;
    cache.set(title, src);
    return src;
  } catch {
    cache.set(title, null);
    return null;
  }
}

export function wikipediaPageUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}
