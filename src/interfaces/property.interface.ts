import { Town } from "./town.interface";

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
}
