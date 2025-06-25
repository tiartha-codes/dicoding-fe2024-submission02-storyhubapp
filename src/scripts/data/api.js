import { getAccessToken } from '../utils/util-auth.js';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  STORY_LIST: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  STORE_NEW_STORY: `${BASE_URL}/stories`,
  STORE_NEW_STORY_GUEST: `${BASE_URL}/stories/guest`,
  SUBSCRIBE_NOTIFICATION: `${BASE_URL}/notifications/subscribe`,
};

// Registrasi user baru
export async function getRegistered({ name, email, password }) {
    const data = JSON.stringify({ name, email, password });
    const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
    });
    const json = await fetchResponse.json();
    return {
        ...json,
        ok: fetchResponse.ok,
    };
}

// Login user
export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });
  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

// Menambah story baru (user login)
export async function addNewStory(formData) {
    const response = await fetch(ENDPOINTS.STORE_NEW_STORY, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getAccessToken()}`,
        },
        body: formData
    });
    return await response.json();
}

// Menambah story baru sebagai guest
export async function addNewStoryGuest(description, photo, lat, lon) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);
  const response = await fetch(ENDPOINTS.STORE_NEW_STORY_GUEST, {
    method: 'POST',
    body: formData,
  });
  return await response.json();
}

// Mengambil semua story (paginated)
export async function getAllStories(page, size, location = 0) {
  const params = new URLSearchParams({ page, size, location });
  const response = await fetch(`${ENDPOINTS.STORY_LIST}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return await response.json();
}

// Mengambil detail story berdasarkan id
export async function getStoryDetail(id) {
  const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return await response.json();
}

// Subscribe push notification
export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });
  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

// Unsubscribe push notification
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ endpoint });
  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}