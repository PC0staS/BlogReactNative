import { BACKEND_URL } from "@/constants";

export async function fetchBlogs() {
  const response = await fetch(`${BACKEND_URL}/api/blogs`, { cache: 'default' });
  if (!response.ok) {
    throw new Error('Failed to fetch blogs');
  }
  return response.json();
}