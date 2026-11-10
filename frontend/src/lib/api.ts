
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch  <T> (
    path: string,
    options :{
        method?: string;
        token?: string | null;
        body?: unknown  ;
    }
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }
    if (options.token) {
        headers["Authorization"] = `Bearer ${options.token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = (await response.json().catch(() => ({}))) as T & { error?: string };

    if (!response.ok) {
        throw new Error( data.error ?? "API request failed with status ");
    }

    return data;

}
