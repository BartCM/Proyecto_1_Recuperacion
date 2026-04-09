import { SERVER } from "../constants";
import { Http } from "../http.class";
import type { NewProperty } from "../interfaces/new-property.interface";
import type { Property } from "../interfaces/property.interface";
import type { Rating } from "../interfaces/rating.interface";

interface GetPropertiesResponse {
  properties: Property[];
  more: boolean;
}

interface GetPropertyResponse {
  property: Property;
}

interface InsertPropertyResponse {
  property: Property;
}

interface GetRatingsResponse {
  ratings: Rating[];
}

interface NewRatingData {
  rating: number;
  comment: string;
}

interface InsertRatingResponse {
  rating: Rating;
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

  async getPropertyById(id: number): Promise<Property | null> {
    const resp = await this.#http.get<GetPropertyResponse>(
      `${SERVER}/properties/${id}`
    );

    return resp?.property ?? null;
  }

  async getRatings(propertyId: number): Promise<Rating[]> {
    const resp = await this.#http.get<GetRatingsResponse>(
      `${SERVER}/properties/${propertyId}/ratings`
    );

    return resp?.ratings ?? [];
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

  async insertRating(
    propertyId: number,
    data: NewRatingData
  ): Promise<InsertRatingResponse> {
    return await this.#http.post<InsertRatingResponse, NewRatingData>(
      `${SERVER}/properties/${propertyId}/ratings`,
      data
    );
  }
}
