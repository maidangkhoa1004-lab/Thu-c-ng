const KEY = "currentUser";

export function saveCurrentUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("currentPetId");
}
