
import type { Property } from "./interfaces/property.interface";
import { setupLogout } from "./auth.guard";
import { PropertiesService } from "./services/properties.service";

//requireAuth();
setupLogout();

const propertyListings = document.getElementById("property-listings");
const cardTemplate = document.getElementById("property-card-template");

const propertiesService = new PropertiesService();

/**
 * Creates a new property card and appends it to the DOM
 * @param propertyData An object with property's data
 */
function createAndAppendCard(propertyData: Property): void {
  if (
    !(propertyListings instanceof HTMLElement) ||
    !(cardTemplate instanceof HTMLTemplateElement)
  ) {
    throw new Error("DOM elements not found");
  }

  const fragment = cardTemplate.content.cloneNode(true);

  if (!(fragment instanceof DocumentFragment)) {
    return;
  }

  const cardClone = fragment.firstElementChild;

  if (!(cardClone instanceof HTMLElement)) {
    return;
  }

  const formattedPrice = Intl.NumberFormat("en-US", {
    currency: "EUR",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(propertyData.price);

  const title = cardClone.querySelector(".property-title");
  title?.append(propertyData.title);

  const location = cardClone.querySelector(".property-location");
  location?.append(
    `${propertyData.address}, ${propertyData.town.name}, ${propertyData.town.province.name}`
  );

  const price = cardClone.querySelector(".property-price");
  price?.append(formattedPrice);

  const description = cardClone.querySelector(".property-description");
  description?.append(propertyData.description);

  const sqmeters = cardClone.querySelector(".property-sqmeters");
  sqmeters?.append(`${propertyData.sqmeters} sqm`);

  const rooms = cardClone.querySelector(".property-rooms");
  rooms?.append(`${propertyData.numRooms} beds`);

  const baths = cardClone.querySelector(".property-baths");
  baths?.append(`${propertyData.numBaths} baths`);

  const image = cardClone.querySelector(".property-image");
  if (image instanceof HTMLImageElement) {
    image.src = propertyData.mainPhoto;
  }

  const deleteButton = cardClone.querySelector(".btn-delete");
  if (deleteButton instanceof HTMLElement) {
    deleteButton.addEventListener("click", async () => {
      await propertiesService.deleteProperty(propertyData.id);
      cardClone.remove();
    });
  }

  propertyListings.append(cardClone);
}

async function getProperties(): Promise<void> {
  const properties = await propertiesService.getProperties();
  properties.forEach((p: Property) => createAndAppendCard(p));
}

void getProperties();
