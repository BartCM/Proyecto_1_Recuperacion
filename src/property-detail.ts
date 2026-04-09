import { PropertiesService } from "./services/properties.service";
import { AuthService } from "./services/auth.service";
import { MapService } from "./services/map.service";
import type { Property } from "./interfaces/property.interface";
import type { Rating } from "./interfaces/rating.interface";

const propertiesService = new PropertiesService();
const authService = new AuthService();

const titleElement = document.getElementById("property-title");
const addressElement = document.getElementById("property-address");
const priceElement = document.getElementById("property-price");
const descriptionElement = document.getElementById("property-description");
const imageElement = document.getElementById("property-image");
const sellerNameElement = document.getElementById("seller-name");
const sellerEmailElement = document.getElementById("seller-email");
const sellerAvatarElement = document.getElementById("seller-photo");

const loginLink = document.getElementById("login-link");
const newPropertyLink = document.getElementById("new-property-link");
const profileLink = document.getElementById("profile-link");
const logoutLink = document.getElementById("logout-link");
const newCommentSection = document.getElementById("rating-form-container");

const totalRatingElement = document.getElementById("total-rating");
const totalStarsElement = document.getElementById("total-stars");
const ratingsContainer = document.getElementById("ratings-container");
const ratingTemplate = document.getElementById("rating-template");
const ratingForm = document.getElementById("rating-form") as HTMLFormElement | null;
const reviewCommentInput = document.getElementById("review-comment") as HTMLTextAreaElement | null;

const mortgageForm = document.getElementById("mortgage-calculator") as HTMLFormElement | null;
const mortgageResult = document.getElementById("mortgage-result");
const monthlyPaymentElement = document.getElementById("monthly-payment");
const mortgagePriceInput = document.getElementById(
  "mortgage-property-price"
) as HTMLInputElement | null;

let currentProperty: Property | null = null;
let mapService: MapService | null = null;

function getPropertyIdFromUrl(): number | null {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if (!id) {
    return null;
  }

  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return null;
  }

  return numericId;
}

function renderStars(rating: number): string {
  const roundedRating = Math.round(rating);
  const filledStars = "★".repeat(roundedRating);
  const emptyStars = "☆".repeat(5 - roundedRating);
  return filledStars + emptyStars;
}

function clearRatingsContainer(): void {
  if (!(ratingsContainer instanceof HTMLElement)) {
    return;
  }

  ratingsContainer.replaceChildren();
}

function createAndPrependRating(rating: Rating): void {
  if (
    !(ratingsContainer instanceof HTMLElement) ||
    !(ratingTemplate instanceof HTMLTemplateElement)
  ) {
    return;
  }

  const fragment = ratingTemplate.content.cloneNode(true);

  if (!(fragment instanceof DocumentFragment)) {
    return;
  }

  const ratingClone = fragment.firstElementChild;

  if (!(ratingClone instanceof HTMLElement)) {
    return;
  }

  const authorElement = ratingClone.querySelector(".rating-author");
  const photoElement = ratingClone.querySelector(".rating-photo");
  const starsElement = ratingClone.querySelector(".rating-stars");
  const commentElement = ratingClone.querySelector(".rating-comment");

  if (authorElement instanceof HTMLAnchorElement) {
    authorElement.href = `profile.html?id=${rating.user.id}`;
    authorElement.textContent = rating.user.name;
  }

  if (photoElement instanceof HTMLImageElement) {
    photoElement.src = rating.user.avatar;

    const photoLink = photoElement.closest("a");
    if (photoLink instanceof HTMLAnchorElement) {
      photoLink.href = `profile.html?id=${rating.user.id}`;
    }
  }

  if (starsElement instanceof HTMLElement) {
    starsElement.textContent = renderStars(rating.rating);
  }

  if (commentElement instanceof HTMLElement) {
    commentElement.textContent = rating.comment;
  }

  ratingsContainer.prepend(ratingClone);
}

function populatePropertyData(property: Property): void {
  titleElement?.replaceChildren(property.title);
  addressElement?.replaceChildren(
    `${property.address}, ${property.town.name}, ${property.town.province.name}`
  );
  priceElement?.replaceChildren(
    Intl.NumberFormat("en-US", {
      currency: "EUR",
      style: "currency",
      maximumFractionDigits: 0,
    }).format(property.price)
  );
  descriptionElement?.replaceChildren(property.description);

  if (imageElement instanceof HTMLImageElement) {
    imageElement.src = property.mainPhoto;
  }

  if (sellerNameElement instanceof HTMLAnchorElement) {
    sellerNameElement.href = `profile.html?id=${property.seller.id}`;
    sellerNameElement.textContent = property.seller.name;
  }

  if (sellerAvatarElement instanceof HTMLImageElement) {
    const sellerAvatarLink = sellerAvatarElement.closest("a");

    sellerAvatarElement.src = property.seller.avatar;

    if (sellerAvatarLink instanceof HTMLAnchorElement) {
      sellerAvatarLink.href = `profile.html?id=${property.seller.id}`;
    }
  }

  if(sellerEmailElement instanceof HTMLElement) {
    sellerEmailElement.textContent = property.seller.email ?? "";
  }

  if (totalRatingElement instanceof HTMLElement) {
    totalRatingElement.textContent = String(property.totalRating ?? 0);
  }

  if (totalStarsElement instanceof HTMLElement) {
    totalStarsElement.textContent = renderStars(property.totalRating ?? 0);
  }

  if (mortgagePriceInput instanceof HTMLInputElement) {
    mortgagePriceInput.value = String(property.price);
  }
}

function loadMap(property: Property): void {
  mapService = new MapService(
    {
      latitude: property.town.latitude,
      longitude: property.town.longitude,
    },
    "map"
  );

  mapService.createMarker({
    latitude: property.town.latitude,
    longitude: property.town.longitude,
  });
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

  if (
    isLogged &&
    currentProperty?.rated === false &&
    newCommentSection instanceof HTMLElement
  ) {
    newCommentSection.classList.remove("hidden");
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

async function loadExistingRatings(propertyId: number): Promise<void> {
  clearRatingsContainer();

  const ratings = await propertiesService.getRatings(propertyId);

  ratings.forEach((rating: Rating) => {
    createAndPrependRating(rating);
  });
}

function getSelectedRatingValue(): number | null {
  if (!ratingForm) {
    return null;
  }

  const formData = new FormData(ratingForm);
  const ratingValue = formData.get("rating");

  if (typeof ratingValue !== "string") {
    return null;
  }

  const numericRating = Number(ratingValue);

  if (Number.isNaN(numericRating)) {
    return null;
  }

  return numericRating;
}

ratingForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  if (!currentProperty || !reviewCommentInput) {
    return;
  }

  const ratingValue = getSelectedRatingValue();

  if (ratingValue === null) {
    alert("You must select a rating");
    return;
  }

  const comment = reviewCommentInput.value.trim();

  if (comment.length === 0) {
    alert("Comment cannot be empty");
    return;
  }

  try {
    const resp = await propertiesService.insertRating(currentProperty.id, {
      rating: ratingValue,
      comment,
    });

    createAndPrependRating(resp.rating);

    const refreshedProperty = await propertiesService.getPropertyById(
      currentProperty.id
    );

    if (refreshedProperty) {
      currentProperty = refreshedProperty;

      if (totalRatingElement instanceof HTMLElement) {
        totalRatingElement.textContent = String(
          refreshedProperty.totalRating ?? 0
        );
      }

      if (totalStarsElement instanceof HTMLElement) {
        totalStarsElement.textContent = renderStars(
          refreshedProperty.totalRating ?? 0
        );
      }
    }

    if (newCommentSection instanceof HTMLElement) {
      newCommentSection.classList.add("hidden");
    }

    currentProperty.rated = true;
    ratingForm.reset();
  } catch (error) {
    console.error(error);
    alert("Could not insert the rating");
  }
});

mortgageForm?.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  if (!mortgageForm || !monthlyPaymentElement || !mortgageResult) {
    return;
  }

  const formData = new FormData(mortgageForm);

  const price = Number(formData.get("propertyPrice") ?? 0);
  const downPayment = Number(formData.get("downPayment") ?? 0);
  const years = Number(formData.get("loanTerm") ?? 0);
  const annualInterest = Number(formData.get("interestRate") ?? 0);

  const principal = price - downPayment;
  const monthlyInterest = annualInterest / 100 / 12;
  const totalMonths = years * 12;

  let monthlyPayment = 0;

  if (monthlyInterest === 0) {
    monthlyPayment = principal / totalMonths;
  } else {
    monthlyPayment =
      (principal *
        (monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths))) /
      (Math.pow(1 + monthlyInterest, totalMonths) - 1);
  }

  monthlyPaymentElement.textContent = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(monthlyPayment);

  mortgageResult.classList.remove("hidden");
});

async function loadProperty(): Promise<void> {
  try {
    const id = getPropertyIdFromUrl();

    if (id === null) {
      location.assign("index.html");
      return;
    }

    const property = await propertiesService.getPropertyById(id);

    if (!property) {
      location.assign("index.html");
      return;
    }

    currentProperty = property;

    populatePropertyData(property);
    loadMap(property);
    await loadExistingRatings(property.id);
    await updateAuthMenu();
    setupLogoutButton();
  } catch (error) {
    console.error("PROPERTY DETAIL ERROR:", error);
  }
}

void loadProperty();