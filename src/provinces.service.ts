import { SERVER } from "./constants.js";
import { Http } from "./http.class.js";
import { Province } from "./interfaces/province.interface.js";
import { Town } from "./interfaces/town.interface.js";


export class ProvincesService {
  #http: Http = new Http();

  async getProvinces(): Promise<Province[]> {
    const resp = await this.#http.get<{ provinces: Province[] }>(`${SERVER}/provinces`);
    return resp?.provinces ?? [];
  }

  async getTowns(idProvince: number): Promise<Town[]> {
    const resp = await this.#http.get<{ towns: Town[] }>(
      `${SERVER}/provinces/${idProvince}/towns`
    );
    return resp?.towns ?? [];
  }
}