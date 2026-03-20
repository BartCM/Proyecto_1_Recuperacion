export function requireAuth(): void {
  const token = localStorage.getItem("token");

  if (!token) {
    location.assign("login.html");
  }
}

export function redirectIfLogged(): void {
  const token = localStorage.getItem("token");

  if (token) {
    location.assign("index.html");
  }
}

export function setupLogout(linkId: string = "login-link"): void {
  const loginLink = document.getElementById(linkId);

  if (!(loginLink instanceof HTMLAnchorElement)) {
    return;
  }

  const token = localStorage.getItem("token");

  if (token) {
    loginLink.title = "Logout";
  }

  loginLink.addEventListener("click", event => {
    const currentToken = localStorage.getItem("token");

    if (currentToken) {
      event.preventDefault();
      localStorage.removeItem("token");
      location.assign("login.html");
    }
  });
}