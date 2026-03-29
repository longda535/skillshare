const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(`${API_URL}${url}`);
  
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    const info = await res.json();
    (error as any).status = res.status;
    (error as any).info = info;
    throw error;
  }

  return res.json().then((json) => json.data);
}

export const API_ENDPOINTS = {
  SKILLS: "/skills",
  CATEGORIES: "/categories",
  TAGS: "/tags",
  SKILL_DETAIL: (id: string) => `/skills/${id}`,
};
