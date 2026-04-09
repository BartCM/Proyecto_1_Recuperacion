import { SERVER } from "../constants";
import { Http } from "../http.class";
import type { User } from "../interfaces/user.interface";

interface SingleUserResponse {
  user: User;
}

interface UpdateAvatarResponse {
  avatar: string;
}

interface UpdateProfileData {
  name: string;
  email: string;
}

interface UpdatePasswordData {
  password: string;
}

interface UpdateAvatarData {
  avatar: string;
}

export class UsersService {
  #http: Http = new Http();

  async getMe(): Promise<User | null> {
    const resp = await this.#http.get<SingleUserResponse>(`${SERVER}/users/me`);
    return resp?.user ?? null;
  }

  async getUserById(id: number): Promise<User | null> {
    const resp = await this.#http.get<SingleUserResponse>(
      `${SERVER}/users/${id}`
    );
    return resp?.user ?? null;
  }

  async updateProfile(data: UpdateProfileData): Promise<void> {
    await this.#http.put<void, UpdateProfileData>(`${SERVER}/users/me`, data);
  }

  async changePassword(data: UpdatePasswordData): Promise<void> {
    await this.#http.put<void, UpdatePasswordData>(
      `${SERVER}/users/me/password`,
      data
    );
  }

  async updateAvatar(avatar: string): Promise<string> {
    const resp = await this.#http.put<UpdateAvatarResponse, UpdateAvatarData>(
      `${SERVER}/users/me/avatar`,
      { avatar }
    );

    return resp?.avatar ?? "";
  }
}
