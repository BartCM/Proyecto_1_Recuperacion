import type { User } from "./user.interface";

export interface Rating {
  id: number;
  rating: number;
  comment: string;
  property: number;
  user: User;
}
