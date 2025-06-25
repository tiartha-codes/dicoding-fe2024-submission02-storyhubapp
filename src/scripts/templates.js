import { showFormattedDate } from './utils';

// Menghasilkan template loader animasi loading
export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
};

// Menghasilkan template loader dengan posisi absolute
export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
};

// Menghasilkan template daftar navigasi utama (beranda, about, bookmark)
export function generateMainNavigationListTemplate() {
  return `
    <li><a href="#/">Beranda</a></li>
    <li><a href="#/about">About</a></li>
     <li><a href="#/bookmarks">Story Tersimpan</a></li>
  `;
};

// Menghasilkan template navigasi untuk user yang belum login
export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a href="#/about">About</a></li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
};

// Menghasilkan template navigasi untuk user yang sudah login
export function generateAuthenticatedNavigationListTemplate() {
  return `
   
    <li><a id="new-story-button" href="#/new">Tambah Story <i class="fas fa-plus"></i></a></li>
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="logout-button" class="logout-button" href="#/logout">Logout <i class="fas fa-sign-out-alt"></i></a></li>
  `;
};

// Menghasilkan template tombol subscribe notifikasi
export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
};

// Menghasilkan template tombol unsubscribe notifikasi
export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
};

// Menghasilkan template tombol simpan story
export function generateSaveStoryButtonTemplate() {
  return `
    <button id="save-story-button" class="save-story-button">
      Simpan Story <i class="far fa-bookmark"></i>
    </button>
  `;
};

// Menghasilkan template tombol hapus story
export function generateRemoveStoryButtonTemplate() {
  return `
    <button id="remove-story-button" class="remove-story-button">
      Hapus Story <i class="fas fa-bookmark"></i>
    </button>
  `;
};