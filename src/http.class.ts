export class Http {
  async ajax<T>(method: string, url: string, body: BodyInit | object | null = null): Promise<T | null> {
    const json = body && ! (body instanceof FormData);
    const headers : HeadersInit = body && json ? { "Content-Type": "application/json" } : {};
    const resp = await fetch(url, { method, headers, body : json ? JSON.stringify(body) : (body as BodyInit | null) });

    if (!resp.ok) {
      throw new Error(resp.statusText);
    }

    if (resp.status !== 204) {
      return (await resp.json());
    } else {
      return null; // 204 implica una respuesta sin datos
    }
  }

  get<T>(url: string): Promise<T | null> {
    return this.ajax("GET", url);
  }

  post<T>(url: string, body: BodyInit | object): Promise<T | null> {
    return this.ajax("POST", url, body);
  }

  put<T>(url: string, body: BodyInit | object): Promise<T | null> {
    return this.ajax("PUT", url,  body);
  }

  delete<T>(url: string): Promise<T | null> {
    return this.ajax("DELETE", url);
  }
}