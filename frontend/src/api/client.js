import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function handleBadgeNotifications(data, showBadgeToast) {
  const list = data?.badgeNotifications;
  if (Array.isArray(list) && list.length && showBadgeToast) {
    for (const b of list) {
      showBadgeToast(b);
    }
  }
}
