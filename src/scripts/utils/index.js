// /utils/index.js

// Mengembalikan promise yang resolve setelah waktu tertentu (ms)
export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Mengubah tanggal ke format lokal yang diinginkan
export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

// Membuat carousel menggunakan tiny-slider
export async function createCarousel(containerElement, options = {}) {
  const { tns } = await import('tiny-slider');

  return tns({
    container: containerElement,
    mouseDrag: true,
    swipeAngle: false,
    speed: 600,

    nav: true,
    navPosition: 'bottom',

    autoplay: false,
    controls: false,

    ...options,
  });
}

// Mengonversi file Blob ke Base64
export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Mengonversi string Base64 ke Blob
export function convertBase64ToBlob(base64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

// Mengonversi Base64 ke Uint8Array
export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Menambahkan event skip to content pada elemen
export function setupSkipToContent(element, mainContent) {
  element.addEventListener('click', () => mainContent.focus());
}

// Membantu transisi tampilan dengan atau tanpa ViewTransition API
export function transitionHelper({ skipTransition = false, updateDOM }) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

    return {
      ready: Promise.reject(Error('View transitions unsupported')),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  return document.startViewTransition(updateDOM);
}

// Mengecek ketersediaan Service Worker di browser
export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

// Mendaftarkan service worker jika tersedia
export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.bundle.js');
    console.log('Service worker telah terpasang', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
}

// Menampilkan indikator status online/offline pada elemen tertentu
export function setOnlineStatusIndicator() {
  const statusEl = document.getElementById('online-status');
  if (!statusEl) return;
  function updateStatus() {
    if (navigator.onLine) {
      statusEl.textContent = 'Online';
      statusEl.classList.add('online');
      statusEl.classList.remove('offline');
    } else {
      statusEl.textContent = 'Offline';
      statusEl.classList.add('offline');
      statusEl.classList.remove('online');
    }
  }
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

// Menampilkan notifikasi pada elemen notifikasi
export function showNotification(message, isError = false) {
  const notif = document.getElementById('notification');
  if (!notif) return;
  notif.textContent = message;
  notif.classList.add('show');
  notif.style.background = isError ? '#b71c1c' : '#323232';
  notif.style.color = isError ? '#fff' : '#fff';
  setTimeout(() => {
    notif.classList.remove('show');
  }, 3000);
}

// Tambahkan baris ini untuk membuat showNotification tersedia secara global
window.showNotification = showNotification;