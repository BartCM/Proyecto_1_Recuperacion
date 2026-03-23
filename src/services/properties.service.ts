import { SERVER } from "../constants";
import { Http } from "../http.class";
import type { NewProperty } from "../interfaces/new-property.interface";
import type { Property } from "../interfaces/property.interface";


interface GetPropertiesResponse {
  properties: Property[];
}

interface InsertPropertyResponse {
  property: Property;
}

export class PropertiesService {
  #http: Http = new Http();

  async getProperties(): Promise<Property[]> {
    const resp = await this.#http.get<GetPropertiesResponse>(
      `${SERVER}/properties`
    );
    return resp?.properties ?? [];
  }

  async insertProperty(property: NewProperty): Promise<Property | null> {
    const resp = await this.#http.post<InsertPropertyResponse, NewProperty>(
      `${SERVER}/properties`,
      property
    );
    return resp?.property ?? null;
  }

  async deleteProperty(id: number): Promise<void> {
    await this.#http.delete(`${SERVER}/properties/${id}`);
  }
}

export { Property };
