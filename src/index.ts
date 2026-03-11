import { PropertiesService, Property } from "./properties.service.ts";

const propertyListings = document.getElementById("property-listings") as HTMLElement | null;
const cardTemplate = document.getElementById("property-card-template") as HTMLTemplateElement | null;

const propertiesService = new PropertiesService();

/**
 * Creates a new property card and appends it to the DOM
 * @param {object} propertyData - An object with property's data
 */
function createAndAppendCard(propertyData: Property): void {
  if (!cardTemplate || !propertyListings){
    return;
  }
  const fragment = cardTemplate.content.cloneNode(true) as DocumentFragment;
  const cardClone = fragment.firstElementChild as HTMLElement;
  if (!cardClone){
    return;
  }

  const formattedPrice = Intl.NumberFormat("en-US", {
    currency: "EUR",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(propertyData.price);

  const title = cardClone.querySelector(".property-title") as HTMLElement | null;
  title?.append(propertyData.title)

  const location = cardClone.querySelector(".property-location") as HTMLElement | null;
  location?.append(`${propertyData.address}, ${propertyData.town.name}, ${propertyData.town.province.name}`);

  const price = cardClone.querySelector(".property-price") as HTMLElement | null;
  price?.append(formattedPrice);

  const description = cardClone.querySelector(".property-description") as HTMLElement | null;
  description?.append(propertyData.description);

  const sqmeters = cardClone.querySelector(".property-sqmeters") as HTMLElement | null;
  sqmeters?.append(`${propertyData.sqmeters} sqm`);

  const rooms = cardClone.querySelector(".property-rooms") as HTMLElement | null;
  rooms?.append(`${propertyData.numRooms} beds`);

  const baths = cardClone.querySelector(".property-baths") as HTMLElement | null;
  baths?.append(`${propertyData.numBaths} baths`);

  const image = cardClone.querySelector(".property-image") as HTMLImageElement | null;
  if(image){
    image.src = propertyData.mainPhoto;
  }

  const deleteButon = cardClone.querySelector(".btn-delete") as HTMLButtonElement | null;
  if(deleteButon){
    deleteButon.addEventListener('click', async () => {
    await propertiesService.deleteProperty(propertyData.id);
    cardClone.remove();
    });
  }

  propertyListings.append(cardClone);
}

async function getProperties() {
    const properties = await propertiesService.getProperties();
    properties.forEach((p: Property) => createAndAppendCard(p));
}

getProperties();