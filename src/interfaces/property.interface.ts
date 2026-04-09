import { Rating } from "./rating.interface";
import type { Town } from "./town.interface";
import type { User } from "./user.interface";

export interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  description: string;
  sqmeters: number;
  numRooms: number;
  numBaths: number;
  mainPhoto: string;
  town: Town;
  seller: User;
  mine?: boolean;
  rated?: boolean;
  totalRating?: number;
  ratings?: Rating[];
}
