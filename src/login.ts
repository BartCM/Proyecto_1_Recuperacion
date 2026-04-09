import type { LoginData } from "./interfaces/login.interface";
import { AuthService } from "./services/auth.service";
import { redirectIfLogged } from "./auth.guard";
import Swal from "sweetalert2";

redirectIfLogged();

const loginForm = document.getElementById(
  "login-form"
) as HTMLFormElement | null;
const emailInput = document.getElementById("email") as HTMLInputElement | null;
const passwordInput = document.getElementById(
  "password"
) as HTMLInputElement | null;

const authService = new AuthService();

loginForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  if (!loginForm || !emailInput || !passwordInput) {
    return;
  }

  const password = passwordInput.value.trim();

  passwordInput.setCustomValidity("");

  if (password.length === 0) {
    passwordInput.setCustomValidity("La contraseña no puede estar vacía");
    passwordInput.reportValidity();
    return;
  }

  if (password.length < 4) {
    passwordInput.setCustomValidity(
      "La contraseña debe tener al menos 4 caracteres"
    );
    passwordInput.reportValidity();
    return;
  }

  if (!loginForm.reportValidity()) {
    return;
  }

  const loginData: LoginData = {
    email: emailInput.value.trim(),
    password,
  };

  try {
    await authService.login(loginData);
    location.assign("index.html");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "error" in error &&
      typeof error.error === "string"
    ) {
      await Swal.fire({
        icon: "error",
        title: "Login error",
        text: error.error,
      });
      return;
    }

    await Swal.fire({
      icon: "error",
      title: "Login error",
      text: "Error al iniciar sesión",
    });
  }
});
