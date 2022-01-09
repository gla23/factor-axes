// Make localStorage fail gracefully if being used within a cross-domain iframe
export function setItem(key: string, data: string) {
  try {
    localStorage.setItem(key, data);
  } catch (e) {}
}
export function getItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch (e) {}
}
