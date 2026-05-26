// Simple API client wrapper
export const apiClient = {
  baseUrl: "",
  setBaseUrl(url) { this.baseUrl = url; },
  async request(path, options = {}) {
    const url = this.baseUrl + path;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }
    return response.json();
  },
};
