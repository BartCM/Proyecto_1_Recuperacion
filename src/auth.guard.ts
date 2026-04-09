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
