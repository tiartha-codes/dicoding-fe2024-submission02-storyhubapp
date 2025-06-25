// Import CSS utama dan Leaflet
import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';
import App from './pages/app';
import CameraHandler from './utils/camera';
import { registerServiceWorker } from './utils';

// Menjalankan aplikasi setelah DOM siap
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    navigationDrawer: document.getElementById('navigation-drawer'),
  });
  await app.renderPage();
  await registerServiceWorker();

  console.log('Berhasil mendaftarkan service worker.');
  
  // Merender ulang halaman dan menghentikan semua stream kamera saat hash berubah
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    CameraHandler.stopAllStreams();
  });
});
