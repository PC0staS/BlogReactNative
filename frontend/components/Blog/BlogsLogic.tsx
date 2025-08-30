import { BACKEND_URL } from "@/constants";

export async function fetchBlogsfromAPI() {
  const url = `${BACKEND_URL}/api/posts`;   
  const response = await fetch(url, { cache: 'default' });
  
  ;
  if (!response.ok) {
    throw new Error(`Failed to fetch blogs (status ${response.status})`);
  }
  const data = await response.json();
  // If backend returns { posts: [...] } normalize to the array
  const parseISODateSafe = (s: string) => {
    if (!s) return null;
    // If there's a timezone offset or Z, keep it. Otherwise append Z to treat as UTC.
    let str = s;
    // Truncate fractional seconds to milliseconds (3 digits) if necessary
    // e.g. 2025-08-30T04:17:49.846114 -> 2025-08-30T04:17:49.846
    str = str.replace(/\.(\d{3})\d+/, '.$1');
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(str)) {
      str = str + 'Z';
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const normalize = (arr: any[]) => {
    return arr.map(p => {
      // keep original created_at string, but add a parsed Date and a localized formatted string
      const createdAt = p.created_at ? parseISODateSafe(p.created_at) : null;
      const createdAtFormatted = createdAt ? createdAt.toLocaleString() : '';
      return { ...p, createdAt, createdAtFormatted };
    });
  };

  if (data && Array.isArray((data as any).posts)) {
    const normalized = normalize((data as any).posts);
    console.log('[fetchBlogsfromAPI] normalized posts array length=', normalized.length);
    return normalized;
  }
  if (Array.isArray(data)) {
    const normalized = normalize(data);
    console.log('[fetchBlogsfromAPI] posts array length=', normalized.length);
    return normalized;
  }
  // unexpected shape -> return empty array
  console.warn('[fetchBlogsfromAPI] unexpected response shape, returning empty array', data);
  return [];
}