export class GitHubAPIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'GitHubAPIError';
  }
}

export class GitHubClient {
  private token: string;
  private baseURL = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    parseBody = true,
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {
        // ignore
      }
      throw new GitHubAPIError(response.status, message);
    }

    if (!parseBody || response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    let url = endpoint;
    if (params) {
      const q = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)]),
        ),
      );
      url += `?${q.toString()}`;
    }
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = void>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'DELETE',
        body: body ? JSON.stringify(body) : undefined,
      },
      false,
    );
  }
}
