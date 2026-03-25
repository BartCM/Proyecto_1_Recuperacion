import { SERVER } from "../constants";
import { Http } from "../http.class";
import type { NewProperty } from "../interfaces/new-property.interface";
import type { Property } from "../interfaces/property.interface";


interface GetPropertiesResponse {
  forEach(arg0: (p: Property) => void): unknown;
  length: number;
  properties: Property[];
  more: boolean;
}

interface InsertPropertyResponse {
  property: Property;
}

export class PropertiesService {
  #http: Http = new Http();

  async getProperties(
    page: number = 1,
    province: string = "0",
    search: string = "",
    seller: string = "0"
  ): Promise<GetPropertiesResponse> {
    const params = new URLSearchParams({
      page: String(page),
      province,
      search,
      seller,
    });

    const resp = await this.#http.get<GetPropertiesResponse>(
      `${SERVER}/properties?${params.toString()}`
    );

    return resp ?? { properties: [], more: false };
  }

  async insertProperty(property: NewProperty): Promise<Property | null> {
    const resp = await this.#http.post<InsertPropertyResponse, NewProperty>(
      `${SERVER}/properties`,
      property
    );
    return resp?.property ?? null;
  }

  async deleteProperty(id: number): Promise<void> {
    await this.#http.delete<void>(`${SERVER}/properties/${id}`);
  }
}

export { Property };
