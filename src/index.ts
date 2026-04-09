import type { Property } from "./interfaces/property.interface";
import type { Province } from "./interfaces/province.interface";
import { PropertiesService } from "./services/properties.service";
import { ProvincesService } from "./services/provinces.service";
import { AuthService } from "./services/auth.service";
import { UsersService } from "./services/users.service";

const loginLink = document.getElementById("login-link");
const newPropertyLink = document.getElementById("new-property-link");
const profileLink = document.getElementById("profile-link");
const logoutLink = document.getElementById("logout-link");

const propertyListings = document.getElementById("property-listings");
const cardTemplate = document.getElementById("property-card-template");
const searchInput = document.getElementById(
  "search-text"
) as HTMLInputElement | null;
const provinceSelect = document.getElementById(
  "province-filter"
) as HTMLSelectElement | null;
const searchForm = document.getElementById(
  "search-form"
) as HTMLFormElement | null;
const loadMoreButton = document.getElementById(
  "load-more-btn"
) as HTMLButtonElement | null;

const propertiesService = new PropertiesService();
const provincesService = new ProvincesService();
const authService = new AuthService();
const usersService = new UsersService();

let currentPage = 1;
let currentSearch = "";
let currentProvince = "0";
let currentSeller = "0";
let currentSellerName = "";

const urlParams = new URLSearchParams(window.location.search);
currentSeller = urlParams.get("seller") ?? "0";

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
  if (title instanceof HTMLElement) {
    const titleLink = document.createElement("a");
    titleLink.href = `property-detail.html?id=${propertyData.id}`;
    titleLink.textContent = propertyData.title;
    title.replaceChildren(titleLink);
  }

  const location = cardClone.querySelector(".property-location");
  location?.append(
    `${propertyData.address}, ${propertyData.town.name}, ${propertyData.town.province.name}`
  );

  const price = cardClone.querySelector(".property-price");
  price?.append(formattedPrice);

  const sqmeters = cardClone.querySelector(".property-sqmeters");
  sqmeters?.append(`${propertyData.sqmeters} sqm`);

  const rooms = cardClone.querySelector(".property-rooms");
  rooms?.append(`${propertyData.numRooms} beds`);

  const baths = cardClone.querySelector(".property-baths");
  baths?.append(`${propertyData.numBaths} baths`);

  const image = cardClone.querySelector(".property-image");
  if (image instanceof HTMLImageElement) {
    image.src = propertyData.mainPhoto;

    const imageLink = document.createElement("a");
    imageLink.href = `property-detail.html?id=${propertyData.id}`;
    image.parentElement?.replaceChild(imageLink, image);
    imageLink.appendChild(image);
  }

  const deleteButton = cardClone.querySelector(".btn-delete");
  if (deleteButton instanceof HTMLElement) {
    if (propertyData.mine) {
      deleteButton.addEventListener("click", async () => {
        const confirmed = confirm(
          "Are you sure you want to delete this property?"
        );

        if (!confirmed) {
          return;
        }

        await propertiesService.deleteProperty(propertyData.id);
        cardClone.remove();
      });
    } else {
      deleteButton.remove();
    }
  }

  propertyListings.append(cardClone);
}

async function getProperties(page: number): Promise<void> {
  if (!(propertyListings instanceof HTMLElement)) {
    return;
  }

  const resp = await propertiesService.getProperties(
    page,
    currentProvince,
    currentSearch,
    currentSeller
  );

  if (page === 1) {
    propertyListings.replaceChildren();
  }

  resp.properties.forEach((p: Property) => {
    createAndAppendCard(p);
  });

  if (loadMoreButton instanceof HTMLButtonElement) {
    if (resp.more) {
      loadMoreButton.classList.remove("hidden");
    } else {
      loadMoreButton.classList.add("hidden");
    }
  }

  updateFilterFeedback();
}

async function loadProvinces(): Promise<void> {
  if (!(provinceSelect instanceof HTMLSelectElement)) {
    return;
  }

  const provinces: Province[] = await provincesService.getProvinces();

  const options = provinces.map((p: Province) => {
    const option = document.createElement("option");
    option.value = String(p.id);
    option.append(p.name);
    return option;
  });

  if (!provinceSelect.firstElementChild) {
    return;
  }

  provinceSelect.replaceChildren(provinceSelect.firstElementChild, ...options);
}

async function loadSellerName(): Promise<void> {
  if (currentSeller === "0") {
    currentSellerName = "";
    return;
  }

  const seller = await usersService.getUserById(Number(currentSeller));

  if (!seller) {
    currentSellerName = "";
    return;
  }

  currentSellerName = seller.name;
}

searchForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  currentSearch = searchInput?.value.trim() ?? "";
  currentProvince = provinceSelect?.value || "0";
  currentPage = 1;

  await getProperties(currentPage);
});

loadMoreButton?.addEventListener("click", async () => {
  currentPage += 1;
  await getProperties(currentPage);
});

function updateFilterFeedback(): void {
  const feedback = document.getElementById("filter-feedback");

  if (!(feedback instanceof HTMLElement)) {
    return;
  }

  const parts: string[] = [];

  if (currentSeller !== "0") {
    parts.push(`Seller: ${currentSellerName || currentSeller}`);
  }

  if (currentProvince !== "0" && provinceSelect instanceof HTMLSelectElement) {
    const selected = provinceSelect.selectedOptions[0];
    const provinceName = selected?.textContent ?? "All";
    parts.push(`Province: ${provinceName}`);
  } else {
    parts.push("Province: All");
  }

  if (currentSearch.trim() !== "") {
    parts.push(`Search: ${currentSearch}`);
  } else {
    parts.push("Search: All");
  }

  feedback.textContent = parts.join(". ");
}

async function updateAuthMenu(): Promise<void> {
  const isLogged = await authService.checkToken();

  if (loginLink instanceof HTMLElement) {
    loginLink.classList.toggle("hidden", isLogged);
  }

  if (newPropertyLink instanceof HTMLElement) {
    newPropertyLink.classList.toggle("hidden", !isLogged);
  }

  if (profileLink instanceof HTMLElement) {
    profileLink.classList.toggle("hidden", !isLogged);
  }

  if (logoutLink instanceof HTMLElement) {
    logoutLink.classList.toggle("hidden", !isLogged);
  }
}

function setupLogoutButton(): void {
  if (!(logoutLink instanceof HTMLButtonElement)) {
    return;
  }

  logoutLink.addEventListener("click", () => {
    authService.logout();
    location.assign("login.html");
  });
}

async function init(): Promise<void> {
  await updateAuthMenu();
  setupLogoutButton();
  await loadProvinces();
  await loadSellerName();
  await getProperties(currentPage);
}

void init();
