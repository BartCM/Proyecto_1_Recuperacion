import { AuthService } from "./auth.service";
import type { LoginData } from "./interfaces/login.interface";

const loginForm = document.getElementById("login-form") as HTMLFormElement | null;
const emailInput = document.getElementById("email") as HTMLInputElement | null;
const passwordInput = document.getElementById("password") as HTMLInputElement | null;

const authService = new AuthService();

if (authService.checkToken()) {
  location.assign("index.html");
}

loginForm?.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

  if (!loginForm || !emailInput || !passwordInput) {
    return;
  }

  if (!loginForm.reportValidity()) {
    return;
  }

  const loginData: LoginData = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
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
      alert(error.error);
      return;
    }

    alert("Error al iniciar sesión");
  }
});