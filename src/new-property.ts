import { Feature } from "ol";
import { Point } from "ol/geom.js";
import { MapService } from "./services/map.service";
import { MyGeolocation } from "./my-geolocation";
import type { NewProperty } from "./interfaces/new-property.interface";
import type { Town } from "./interfaces/town.interface";
import type { Province } from "./interfaces/province.interface";
import { PropertiesService } from "./services/properties.service";
import { ProvincesService } from "./services/provinces.service";
import { requireAuth, setupLogout } from "./auth.guard";

requireAuth();
setupLogout();

const propertyForm = document.getElementById("property-form") as HTMLFormElement | null;
const mainPhotoInput = document.getElementById("mainPhoto") as HTMLInputElement | null;
const imagePreview = document.getElementById("image-preview") as HTMLImageElement | null;
const provincesSelect = document.getElementById("province") as HTMLSelectElement | null;
const townsSelect = document.getElementById("town") as HTMLSelectElement | null;

const propertiesService = new PropertiesService();
const provincesService = new ProvincesService();

let mapService: MapService | null = null;
let marker: Feature<Point> | null = null;
let towns: Town[] = [];

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
        imagePreview.src = typeof reader.result === "string" ? reader.result : "";
        imagePreview.classList.remove("hidden");
      });
    }

    mainPhotoInput.reportValidity();
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

  await propertiesService.insertProperty(propertyData);
  location.assign("index.html");
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

  townsSelect.replaceChildren(
    townsSelect.firstElementChild,
    ...options
  );
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

void loadProvinces();
void loadMap();