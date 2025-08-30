import { BACKEND_URL } from "@/constants";

// Join URL segments safely (no duplicate slashes)
const trimSlashes = (s: string) => s.replace(/\/+$/, '');
const joinUrl = (...parts: string[]) => parts
  .filter(Boolean)
  .map((p, i) => i === 0 ? trimSlashes(p) : p.replace(/^\/+/, '').replace(/\/+$/, ''))
  .join('/');

const API_BASE = trimSlashes(BACKEND_URL);

export async function fetchBlogsfromAPI() {
  const url = joinUrl(API_BASE, 'api', 'posts');  
  const response = await fetch(url, { cache: 'default' });

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
      // Robust date mapping: try common keys
      const rawDate = p.created_at || p.createdAt || p.published_at || p.publishedAt || p.date;
      const createdAt = rawDate ? parseISODateSafe(String(rawDate)) : null;
      const createdAtFormatted = createdAt ? createdAt.toLocaleString() : '';
      // Robust author mapping: accept string or nested user
      const author = typeof p.author === 'string'
        ? p.author
        : (p.author && (p.author.name || p.author.username || p.author.email))
          || (p.user && (p.user.name || p.user.username || p.user.email))
          || p.author_name
          || p.authorName
          || p.created_by
          || p.createdBy
          || p.author; // leave as-is if unknown shape
  return { ...p, author, createdAt, createdAtFormatted };
    });
  };

  if (data && Array.isArray((data as any).posts)) {
    const normalized = normalize((data as any).posts);
    return normalized;
  }
  if (Array.isArray(data)) {
    const normalized = normalize(data);
    return normalized;
  }
  // unexpected shape -> return empty array
  console.warn('[fetchBlogsfromAPI] unexpected response shape, returning empty array', data);
  return [];
}

export async function fetchBlogById(id: string | number) {
  const url = joinUrl(API_BASE, 'api', 'posts', String(id));
  const response = await fetch(url, { cache: 'default' as any });
  if (!response.ok) {
    throw new Error(`Failed to fetch post ${id} (status ${response.status})`);
  }
  const data = await response.json();

  const parseISODateSafe = (s: string) => {
    if (!s) return null;
    let str = s.replace(/\.(\d{3})\d+/, '.$1');
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(str)) str = str + 'Z';
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const p = (data && (data.post || data)) as any;
  if (!p) return null;
  const rawDate = p.created_at || p.createdAt || p.published_at || p.publishedAt || p.date;
  const createdAt = rawDate ? parseISODateSafe(String(rawDate)) : null;
  const createdAtFormatted = createdAt ? createdAt.toLocaleString() : '';
  const author = typeof p.author === 'string'
    ? p.author
    : (p.author && (p.author.name || p.author.username || p.author.email))
      || (p.user && (p.user.name || p.user.username || p.user.email))
      || p.author_name
      || p.authorName
      || p.created_by
      || p.createdBy
      || p.author;
  const normalized = { ...p, author, createdAt, createdAtFormatted };
  return normalized;
}

export async function postBlogToAPI(title: string, content: string, image: string) {
  const url = joinUrl(API_BASE, 'api', 'posts');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content, image }),
  });
  if (!response.ok) {
    throw new Error(`Failed to post blog (status ${response.status})`);
  }
  const data = await response.json();
  return data;
}

// Multipart variant that uploads an image file alongside the title and MDX content
export async function createPostWithImage(params: {
  title: string;
  mdx: string;
  image: { uri: string; name?: string; type?: string };
  author?: string;
  created_at?: string; // ISO string recommended
}) {
  const { title, mdx, image, author, created_at } = params;
  const url = joinUrl(API_BASE, 'api', 'posts');

  const form = new FormData();
  form.append('title', title);
  // backend expects MDX content in 'content' or 'mdx'; try 'content' as common field name
  form.append('content', mdx);
  if (author) form.append('author', author);
  if (created_at) form.append('created_at', created_at);

  const filename = image.name || image.uri.split('/').pop() || `upload-${Date.now()}.jpg`;
  const mime = image.type || (filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
  form.append('image', {
    // @ts-ignore RN FormData file object
    uri: image.uri,
    name: filename,
    type: mime,
  } as any);

  const response = await fetch(url, {
    method: 'POST',
    // don't set Content-Type; RN fetch will set proper multipart boundary
    body: form,
  } as any);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to create post (status ${response.status}) ${text}`);
  }
  return response.json();
}

// JSON variant compatible with backend that expects JSON body
export async function createPostJSON(params: {
  title: string;
  mdx: string;
  thumbnail_base64?: string;
  author?: string;
  created_at?: string;
}) {
  const { title, mdx, thumbnail_base64, author, created_at } = params;
  const url = joinUrl(API_BASE, 'api', 'posts');
  const body: any = { title, content: mdx };
  if (thumbnail_base64) body.thumbnail_base64 = thumbnail_base64;
  if (author) body.author = author;
  if (created_at) body.created_at = created_at;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to create post (status ${response.status}) ${text}`);
  }
  return response.json();
}


export async function deletePost(id: string) {
  const url = joinUrl(API_BASE, 'api', 'posts', String(id));
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to delete post (status ${response.status}) ${text}`);
  }
  return response.json();
}