import Swal from "sweetalert2";
import { AuthService } from "./services/auth.service";
import { UsersService } from "./services/users.service";
import type { User } from "./interfaces/user.interface";

const authService = new AuthService();
const usersService = new UsersService();

const profileName = document.getElementById("user-name");
const profileEmail = document.getElementById("user-email");
const profileAvatar = document.getElementById("avatar-image");

const editNameInput = document.getElementById(
  "name"
) as HTMLInputElement | null;
const editEmailInput = document.getElementById(
  "email"
) as HTMLInputElement | null;
const avatarInput = document.getElementById(
  "avatar-upload"
) as HTMLInputElement | null;

const editProfileButton = document.getElementById("edit-profile-btn");
const changePasswordButton = document.getElementById("change-password-btn");
const avatarOverlay = document.getElementById("avatar-image-overlay");
const logoutLink = document.getElementById("logout-link");
const myPropertiesLink = document.getElementById("my-properties-link");

const editProfileForm = document.getElementById(
  "edit-profile-form"
) as HTMLFormElement | null;
const changePasswordForm = document.getElementById(
  "change-password-form"
) as HTMLFormElement | null;

const cancelEditProfileButton = document.getElementById("cancel-edit-profile");
const cancelChangePasswordButton = document.getElementById(
  "cancel-change-password"
);

const newPasswordInput = document.getElementById(
  "new-password"
) as HTMLInputElement | null;
const confirmNewPasswordInput = document.getElementById(
  "confirm-new-password"
) as HTMLInputElement | null;

let currentUser: User | null = null;

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

function getUserIdFromUrl(): number | null {
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

function populateUserData(user: User): void {
  currentUser = user;

  profileName?.replaceChildren(user.name);
  profileEmail?.replaceChildren(user.email ?? "");

  if (profileAvatar instanceof HTMLImageElement) {
    profileAvatar.src = user.avatar;
  }

  if (editNameInput instanceof HTMLInputElement) {
    editNameInput.value = user.name;
  }

  if (editEmailInput instanceof HTMLInputElement) {
    editEmailInput.value = user.email ?? "";
  }

  if (myPropertiesLink instanceof HTMLAnchorElement) {
    myPropertiesLink.href = `index.html?seller=${user.id}`;
  }
}

function updateProfileVisibility(user: User): void {
  const isMe = user.me === true;

  editProfileButton?.classList.toggle("hidden", !isMe);
  changePasswordButton?.classList.toggle("hidden", !isMe);

  if (avatarOverlay instanceof HTMLElement) {
    avatarOverlay.classList.toggle("hidden", !isMe);
  }

  if (avatarInput instanceof HTMLInputElement) {
    avatarInput.disabled = !isMe;
  }
}

function toggleEditProfileForm(show: boolean): void {
  if (show) {
    editProfileButton?.classList.add("hidden");
    editProfileForm?.classList.remove("hidden");
  } else {
    editProfileForm?.classList.add("hidden");
    editProfileButton?.classList.remove("hidden");
  }
}

function toggleChangePasswordForm(show: boolean): void {
  if (show) {
    changePasswordButton?.classList.add("hidden");
    changePasswordForm?.classList.remove("hidden");
  } else {
    changePasswordForm?.classList.add("hidden");
    changePasswordButton?.classList.remove("hidden");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read file"));
      }
    });

    reader.addEventListener("error", () => {
      reject(new Error("Could not read file"));
    });

    reader.readAsDataURL(file);
  });
}

avatarInput?.addEventListener("change", async () => {
  if (!avatarInput || !(profileAvatar instanceof HTMLImageElement)) {
    return;
  }

  const file = avatarInput.files?.[0];

  if (!file) {
    return;
  }

  try {
    const base64Avatar = await fileToBase64(file);
    const avatarUrl = await usersService.updateAvatar(base64Avatar);

    profileAvatar.src = avatarUrl;

    if (currentUser) {
      currentUser.avatar = avatarUrl;
    }

    await Swal.fire({
      icon: "success",
      title: "Avatar updated",
      text: "Your avatar has been updated successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not update avatar";

    await Swal.fire({
      icon: "error",
      title: "Avatar update error",
      text: message,
    });
  }
});

editProfileButton?.addEventListener("click", () => {
  toggleEditProfileForm(true);
});

cancelEditProfileButton?.addEventListener("click", () => {
  toggleEditProfileForm(false);
});

changePasswordButton?.addEventListener("click", () => {
  toggleChangePasswordForm(true);
});

cancelChangePasswordButton?.addEventListener("click", () => {
  toggleChangePasswordForm(false);
});

editProfileForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  if (!editNameInput || !editEmailInput || !currentUser) {
    return;
  }

  try {
    await usersService.updateProfile({
      name: editNameInput.value.trim(),
      email: editEmailInput.value.trim(),
    });

    const updatedUser: User = {
      ...currentUser,
      name: editNameInput.value.trim(),
      email: editEmailInput.value.trim(),
    };

    populateUserData(updatedUser);
    toggleEditProfileForm(false);

    await Swal.fire({
      icon: "success",
      title: "Profile updated",
      text: "Your profile has been updated successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not update profile";

    await Swal.fire({
      icon: "error",
      title: "Profile update error",
      text: message,
    });
  }
});

changePasswordForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  if (!newPasswordInput || !confirmNewPasswordInput) {
    return;
  }

  if (newPasswordInput.value.length < 4) {
    await Swal.fire({
      icon: "error",
      title: "Password error",
      text: "Password must contain at least 4 characters",
    });
    return;
  }

  if (newPasswordInput.value !== confirmNewPasswordInput.value) {
    await Swal.fire({
      icon: "error",
      title: "Password error",
      text: "Passwords do not match",
    });
    return;
  }

  try {
    await usersService.changePassword({
      password: newPasswordInput.value,
    });

    changePasswordForm.reset();
    toggleChangePasswordForm(false);

    await Swal.fire({
      icon: "success",
      title: "Password updated",
      text: "Your password has been updated successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not update password";

    await Swal.fire({
      icon: "error",
      title: "Password update error",
      text: message,
    });
  }
});

async function loadUserProfile(): Promise<void> {
  const userId = getUserIdFromUrl();
  let user: User | null = null;

  if (userId === null) {
    user = await usersService.getMe();
  } else {
    user = await usersService.getUserById(userId);
  }

  if (!user) {
    location.assign("index.html");
    return;
  }

  populateUserData(user);
  updateProfileVisibility(user);
}

async function init(): Promise<void> {
  await checkAuth();
  setupLogoutButton();
  await loadUserProfile();
}

void init();
