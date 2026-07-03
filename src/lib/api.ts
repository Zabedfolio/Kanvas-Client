export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers = new Headers(options.headers || {});
    
    // Set content-type to JSON by default unless it's FormData (which needs custom boundary headers automatically set by browser)
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`/api/proxy${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData = "";
        try {
            errorData = await response.text();
            const json = JSON.parse(errorData);
            errorData = json.detail || json.message || errorData;
        } catch {
            // ignore fallback
        }
        throw new Error(errorData || `Request failed with status ${response.status}`);
    }

    // Handle 204 No Content response
    if (response.status === 204) {
        return null as unknown as T;
    }

    return response.json();
}
