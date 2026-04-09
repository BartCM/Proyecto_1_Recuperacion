import Swal from "sweetalert2";
import { Feature } from "ol";
import { Point } from "ol/geom.js";
import { MapService } from "./services/map.service";
import { MyGeolocation } from "./my-geolocation";
import type { NewProperty } from "./interfaces/new-property.interface";
import type { Town } from "./interfaces/town.interface";
import type { Province } from "./interfaces/province.interface";
import { PropertiesService } from "./services/properties.service";
import { ProvincesService } from "./services/provinces.service";
import { AuthService } from "./services/auth.service";
import { generateTitle, translateToEnglish } from "./ai-tools";

const propertyForm = document.getElementById(
  "property-form"
) as HTMLFormElement | null;
const mainPhotoInput = document.getElementById(
  "mainPhoto"
) as HTMLInputElement | null;
const imagePreview = document.getElementById(
  "image-preview"
) as HTMLImageElement | null;
const provincesSelect = document.getElementById(
  "province"
) as HTMLSelectElement | null;
const townsSelect = document.getElementById("town") as HTMLSelectElement | null;

const descriptionInput = document.getElementById(
  "description"
) as HTMLTextAreaElement | null;
const titleInput = document.getElementById("title") as HTMLInputElement | null;
const translateButton = document.getElementById(
  "translate-button"
) as HTMLButtonElement | null;
const generateButton = document.getElementById(
  "generate-button"
) as HTMLButtonElement | null;
const logoutLink = document.getElementById("logout-link");

const propertiesService = new PropertiesService();
const provincesService = new ProvincesService();
const authService = new AuthService();

let mapService: MapService | null = null;
let marker: Feature<Point> | null = null;
let towns: Town[] = [];

async function checkAuth(): Promise<void> {
  const isLogged = await authService.checkToken();

  if (!isLogged) {
    location.assign("login.html");
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

function getFormDataString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

mainPhotoInput?.addEventListener("change", () => {
  if (!mainPhotoInput || !imagePreview) {
    return;
  }

  const file = mainPhotoInput.files?.[0];
  imagePreview.src = "";
  imagePreview.classList.add("hidden");

  if (file) {
    if (!file.type.startsWith("image")) {
      mainPhotoInput.setCustomValidity("File must be an image");
    } else if (file.size > 200000) {
      mainPhotoInput.setCustomValidity(
        "You can't add an image larger than 200KB"
      );
    } else {
      mainPhotoInput.setCustomValidity("");

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.addEventListener("load", () => {
        imagePreview.src =
          typeof reader.result === "string" ? reader.result : "";
        imagePreview.classList.remove("hidden");
      });
    }

    mainPhotoInput.reportValidity();
  }
});

translateButton?.addEventListener("click", async () => {
  if (!descriptionInput) {
    return;
  }

  try {
    const translated = await translateToEnglish(descriptionInput.value);
    descriptionInput.value = translated;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Translation error";

    await Swal.fire({
      icon: "error",
      title: "Translation error",
      text: message,
    });
  }
});

generateButton?.addEventListener("click", async () => {
  if (!descriptionInput || !titleInput) {
    return;
  }

  if (descriptionInput.value.trim().length < 20) {
    await Swal.fire({
      icon: "error",
      title: "Generation error",
      text: "Description must contain at least 20 characters",
    });
    return;
  }

  try {
    const generated = await generateTitle(descriptionInput.value);
    titleInput.value = generated;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Title generation error";

    await Swal.fire({
      icon: "error",
      title: "Generation error",
      text: message,
    });
  }
});

propertyForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  if (!propertyForm || !imagePreview) {
    return;
  }

  if (!propertyForm.reportValidity()) {
    return;
  }

  const formData = new FormData(propertyForm);

  const propertyData: NewProperty = {
    title: getFormDataString(formData, "title"),
    description: getFormDataString(formData, "description"),
    townId: Number(formData.get("town") ?? 0),
    address: getFormDataString(formData, "address"),
    price: Number(formData.get("price") ?? 0),
    sqmeters: Number(formData.get("sqmeters") ?? 0),
    numRooms: Number(formData.get("numRooms") ?? 0),
    numBaths: Number(formData.get("numBaths") ?? 0),
    mainPhoto: imagePreview.src,
  };

  try {
    await propertiesService.insertProperty(propertyData);
    location.assign("index.html");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not create property";

    await Swal.fire({
      icon: "error",
      title: "Create property error",
      text: message,
    });
  }
});

provincesSelect?.addEventListener("change", () => {
  if (!provincesSelect) {
    return;
  }

  void loadTowns(Number(provincesSelect.value));
});

townsSelect?.addEventListener("change", () => {
  if (!townsSelect || !mapService || !marker) {
    return;
  }

  const selectedTown = towns.find(
    (t: Town) => t.id === Number(townsSelect.value)
  );
  const latitude = selectedTown?.latitude ?? 0;
  const longitude = selectedTown?.longitude ?? 0;

  mapService.view.setCenter([longitude, latitude]);
  marker.setGeometry(new Point([longitude, latitude]));
});

async function loadProvinces(): Promise<void> {
  if (!provincesSelect) {
    return;
  }

  const provinces: Province[] = await provincesService.getProvinces();

  const options = provinces.map((p: Province) => {
    const option = document.createElement("option");
    option.value = String(p.id);
    option.append(p.name);
    return option;
  });

  if (!provincesSelect.firstElementChild) {
    return;
  }

  provincesSelect.replaceChildren(
    provincesSelect.firstElementChild,
    ...options
  );
}

async function loadTowns(idProvince: number): Promise<void> {
  if (!townsSelect) {
    return;
  }

  towns = await provincesService.getTowns(idProvince);

  const options = towns.map((t: Town) => {
    const option = document.createElement("option");
    option.value = String(t.id);
    option.append(t.name);
    return option;
  });

  if (!townsSelect.firstElementChild) {
    return;
  }

  townsSelect.replaceChildren(townsSelect.firstElementChild, ...options);
}

async function loadMap(): Promise<void> {
  const coords = (await MyGeolocation.getLocation()) as GeolocationCoordinates;

  mapService = new MapService(
    { latitude: coords.latitude, longitude: coords.longitude },
    "map"
  );

  marker = mapService.createMarker({
    latitude: coords.latitude,
    longitude: coords.longitude,
  });
}

async function init(): Promise<void> {
  await checkAuth();
  setupLogoutButton();
  await loadProvinces();
  await loadMap();
}

void init();
