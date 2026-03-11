import { Feature } from "ol";
import { Point } from "ol/geom.js";
import { MapService } from "./map.service.ts";
import { MyGeolocation } from "./my-geolocation.ts";
import { PropertiesService } from "./properties.service.ts";
import { ProvincesService } from "./provinces.service.ts";
import { NewProperty } from "./interfaces/new-property.interface";
import { Town } from "./interfaces/town.interface.ts";
import { Province } from "./interfaces/province.interface.ts";

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

mainPhotoInput?.addEventListener("change", () => {
  if (!mainPhotoInput || !imagePreview){
    return;
  } 

  const file = mainPhotoInput.files?.[0];
  imagePreview.src = "";
  imagePreview.classList.add("hidden");

  if (file) {
    if (!file.type.startsWith("image")) {
      mainPhotoInput.setCustomValidity("File must be an image");
    } else if (file.size > 200000) {
      mainPhotoInput.setCustomValidity("You can't add an image larger than 200KB");
    } else {
      mainPhotoInput.setCustomValidity("");

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.addEventListener("load", () => {
        imagePreview.src = reader.result as string;
        imagePreview.classList.remove("hidden");
      });
    }

    mainPhotoInput.reportValidity();
  }
});

propertyForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  if (!propertyForm || !imagePreview){
    return;
  } 
  if (!propertyForm.reportValidity()){
    return;
  } 

  const formData = new FormData(propertyForm);

  const propertyData: NewProperty = {
    title: formData.get("title"),
    description: formData.get("description"),
    townId: Number(formData.get("town")),
    address: formData.get("address"),
    price: Number(formData.get("price")),
    sqmeters: Number(formData.get("sqmeters")),
    numRooms: Number(formData.get("numRooms")),
    numBaths: Number(formData.get("numBaths")),
    mainPhoto: imagePreview.src,
  };

  await propertiesService.insertProperty(propertyData);
  location.assign("index.html");
});

provincesSelect?.addEventListener("change", () => {
  if (!provincesSelect){
    return;
  }
  loadTowns(Number(provincesSelect.value));
});

townsSelect?.addEventListener("change", () => {
  if (!townsSelect || !mapService || !marker){
    return;
  } 

  const selectedTown = towns.find((t: Town) => t.id === Number(townsSelect.value));
  const latitude = selectedTown?.latitude ?? 0;
  const longitude = selectedTown?.longitude ?? 0;

  mapService.view.setCenter([longitude, latitude]);
  marker.setGeometry(new Point([longitude, latitude]));
});

async function loadProvinces(): Promise<void> {
  if (!provincesSelect){
    return;
  } 

  const provinces: Province[] = await provincesService.getProvinces();

  const options = Array.from(provinces).map((p: Province) => {
    const option = document.createElement("option");
    option.value = String(p.id);
    option.append(p.name);
    return option;
  });

  provincesSelect.replaceChildren(
    provincesSelect.firstElementChild as Element,
    ...options
  );
}

async function loadTowns(idProvince: number): Promise<void> {
  if (!townsSelect){
    return;
  } 

  towns = await provincesService.getTowns(idProvince);

  const options = towns.map((t: Town) => {
    const option = document.createElement("option");
    option.value = String(t.id);
    option.append(t.name);
    return option;
  });

  townsSelect.replaceChildren(
    townsSelect.firstElementChild as Element,
    ...options
  );
}

async function loadMap(): Promise<void> {
  const coords = await MyGeolocation.getLocation();
  mapService = new MapService(
    { latitude: coords.latitude, longitude: coords.longitude },
    "map"
  );
  marker = mapService.createMarker({
    latitude: coords.latitude,
    longitude: coords.longitude,
  });
}

loadProvinces();
loadMap();