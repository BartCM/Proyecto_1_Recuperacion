export interface NewProperty {
  title: FormDataEntryValue | null;
  description: FormDataEntryValue | null;
  townId: number;
  address: FormDataEntryValue | null;
  price: number;
  sqmeters: number;
  numRooms: number;
  numBaths: number;
  mainPhoto: string;
}