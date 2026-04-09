import { SERVER } from "../constants";
import { Http } from "../http.class";
import type { LoginResponse } from "../interfaces/login-response.interface";
import type { LoginData } from "../interfaces/login.interface";
import type { RegisterData } from "../interfaces/register.interface";


export class AuthService {
  #http: Http = new Http();

  async login(data: LoginData): Promise<string> {
    const resp = await this.#http.post<LoginResponse, LoginData>(
      `${SERVER}/auth/login`,
      data
    );

    if (!resp?.accessToken) {
      throw new Error("Token not received");
    }

    localStorage.setItem("token", resp.accessToken);
    return resp.accessToken;
  }

  async register(data: RegisterData): Promise<void> {
    await this.#http.post<unknown, RegisterData>(`${SERVER}/auth/register`, data);
  }

  async checkToken(): Promise<boolean> {
  try {
    await this.#http.get<void>(`${SERVER}/auth/validate`);
    return true;
  } catch {
    return false;
  }
}

  logout(): void {
    localStorage.removeItem("token");
  }
}