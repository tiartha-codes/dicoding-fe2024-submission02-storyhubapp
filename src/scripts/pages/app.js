import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../templates';
import { isServiceWorkerAvailable, setupSkipToContent, transitionHelper, setOnlineStatusIndicator, showNotification } from '../utils';
import { getAccessToken, getLogout } from '../utils/util-auth';
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification-helper';

export default class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  // Konstruktor: inisialisasi App dengan elemen utama
  constructor({ content, navigationDrawer, drawerButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#init();
  }

  // Inisialisasi drawer dan status online
  #init() {
    this.#setupDrawer();
    setOnlineStatusIndicator();
  }

  // Mengatur event handler untuk drawer navigasi
  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#navigationDrawer.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  // Mengatur tombol subscribe/unsubscribe push notification
  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    if (!pushNotificationTools) {
      // Jika elemen tidak ditemukan, jangan lakukan apa-apa
      console.warn('push-notification-tools element not found in DOM');
      return;
    }
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button').addEventListener('click', async () => {
        await unsubscribe();
        this.#setupPushNotification();
      });
      return;
    }
    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', async () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  // Mengatur isi navigation list berdasarkan status login
  #setupNavigationList() {
    const isLoggedIn = getAccessToken();
    const navListMain = this.#navigationDrawer.children.namedItem('navlist-main');
    const navList = this.#navigationDrawer.children.namedItem('navlist');

    if (!isLoggedIn) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (confirm('Are you sure to logout?')) {
          getLogout();
          location.hash = '/login';
        }
      });
    }
  }

  // Merender halaman sesuai route aktif
  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url] || routes['*'];

    const page = route();

    if (!page || typeof page.render !== 'function') {
      this.#content.innerHTML = '<h2>404 - Page Not Found</h2>';
      return;
    }

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        if (typeof page.afterRender === 'function') {
          await page.afterRender();
        }
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();
      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}


