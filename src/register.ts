import Swal from "sweetalert2";
import { redirectIfLogged, setupLogout } from "./auth.guard";
import { AuthService } from "./services/auth.service";
import type { RegisterData } from "./interfaces/register.interface";

redirectIfLogged();
setupLogout();

const registerForm = document.getElementById("register-form") as HTMLFormElement | null;
const nameInput = document.getElementById("name") as HTMLInputElement | null;
const emailInput = document.getElementById("email") as HTMLInputElement | null;
const passwordInput = document.getElementById("password") as HTMLInputElement | null;
const repeatPasswordInput = document.getElementById("password-confirm") as HTMLInputElement | null;
const avatarInput = document.getElementById("avatar") as HTMLInputElement | null;
const imagePreview = document.getElementById("avatar-preview") as HTMLImageElement | null;

const authService = new AuthService();

function validatePasswords(): void {
  if (!passwordInput || !repeatPasswordInput) {
    return;
  }

  if (passwordInput.value !== repeatPasswordInput.value) {
    repeatPasswordInput.setCustomValidity("Passwords do not match");
  } else {
    repeatPasswordInput.setCustomValidity("");
  }
}

passwordInput?.addEventListener("input", validatePasswords);
repeatPasswordInput?.addEventListener("input", validatePasswords);

avatarInput?.addEventListener("change", () => {
  if (!avatarInput || !imagePreview) {
    return;
  }

  const file = avatarInput.files?.[0];
  imagePreview.src = "";
  imagePreview.classList.add("hidden");

  if (file) {
    if (!file.type.startsWith("image")) {
      avatarInput.setCustomValidity("File must be an image");
    } else if (file.size > 200000) {
      avatarInput.setCustomValidity("You can't add an image larger than 200KB");
    } else {
      avatarInput.setCustomValidity("");

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.addEventListener("load", () => {
        imagePreview.src =
          typeof reader.result === "string" ? reader.result : "";
        imagePreview.classList.remove("hidden");
      });
    }

    avatarInput.reportValidity();
  }
});

registerForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  if (
    !registerForm ||
    !nameInput ||
    !emailInput ||
    !passwordInput ||
    !repeatPasswordInput ||
    !imagePreview
  ) {
    return;
  }

  validatePasswords();

  if (!registerForm.reportValidity()) {
    return;
  }

  const registerData: RegisterData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    avatar: imagePreview.src,
  };

  try {
    await authService.register(registerData);

    await Swal.fire({
      icon: "success",
      title: "Register completed",
      text: "User registered successfully",
    });

    location.assign("login.html");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      Array.isArray(error.message)
    ) {
      await Swal.fire({
        icon: "error",
        title: "Register error",
        html: error.message.map((msg: string) => `<div>${msg}</div>`).join(""),
      });
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "error" in error &&
      typeof error.error === "string"
    ) {
      await Swal.fire({
        icon: "error",
        title: "Register error",
        text: error.error,
      });
      return;
    }

    await Swal.fire({
      icon: "error",
      title: "Register error",
      text: "Could not complete registration",
    });
  }
});