// routes.js
import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import NewStoryPage from '../pages/new-story/new-story-page';
import DetailStoryPage from '../pages/detail-story/detail-story-page';
import BookmarkPage from '../pages/bookmark/bookmark-page'; // Import BookmarkPage
import NotFoundPage from '../pages/404/not-found-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/util-auth';

// Mendefinisikan mapping antara path dan komponen halaman (SPA route)
const routes = {
    '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
    '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
    '/': () => checkAuthenticatedRoute(new HomePage()),
    '/about': () => checkUnauthenticatedRouteOnly(new AboutPage()),
    '/new': () => checkAuthenticatedRoute(new NewStoryPage()),
    '/detail/:id': () => checkAuthenticatedRoute(new DetailStoryPage()),
    '/bookmarks': () => checkAuthenticatedRoute(new BookmarkPage()), // Tambah rute baru
    '*': () => checkUnauthenticatedRouteOnly(new NotFoundPage()),
};

export default routes;