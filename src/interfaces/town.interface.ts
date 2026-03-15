import { Province } from "./province.interface";

export interface Town {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  province: Province;
}
