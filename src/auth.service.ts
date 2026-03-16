import { SERVER } from "./constants";
import { Http } from "./http.class";
import type { LoginData } from "./interfaces/login.interface";
import type { LoginResponse } from "./interfaces/login-response.interface";

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

  checkToken(): boolean {
    return localStorage.getItem("token") !== null;
  }

  logout(): void {
    localStorage.removeItem("token");
  }
}