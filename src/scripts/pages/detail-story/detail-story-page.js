import DetailStoryPresenter from './detail-story-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';
import Map from '../../utils/maps.js';
import 'leaflet/dist/leaflet.css';
import Database from '../../data/database.js';
import { generateSaveStoryButtonTemplate, generateRemoveStoryButtonTemplate } from '../../templates.js';

class DetailStoryPage {
    #presenter = null;
    #storyDetailContainer = null;
    #storyPhotoContainer = null;
    #mapContainer = null;
    #map = null;

    // Merender tampilan halaman detail story
    async render() {
        return `
            <a href="#main-content" class="skip-link">Skip to Content</a>
            <section class="detail-story-page">
                <h1>STORY</h1>
                <div id="main-content" class="container">
                    <div class="story-header">
                        <div id="story-photo-container" class="story-photo">
                            <p>Memuat Gambar Story...</p>
                        </div>
                    </div>
                    <div class="content-section">
                        <div id="story-detail-container" class="story-details">
                            <p>Memuat detail Story...</p>
                        </div>
                        <div id="map-container" class="content-block map-container">
                            <p>Memuat peta...</p>
                        </div>
                    </div>
                    <div class="button-group"> <div class="back-to-home">
                            <a href="#" id="back-to-home-link">Kembali ke Beranda ...</a>
                        </div>
                        <div id="save-actions-container" class="save-action-container"></div>
                    </div>
                </div>
            </section>
        `;
    }

    // Dipanggil setelah elemen halaman dirender ke DOM
    async afterRender() {
        this.#storyDetailContainer = document.getElementById('story-detail-container');
        this.#storyPhotoContainer = document.getElementById('story-photo-container');
        this.#mapContainer = document.getElementById('map-container');
        const storyId = window.location.hash.split('/').pop();

        this.#presenter = new DetailStoryPresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
            dbModel: Database,
        });

        await this.#presenter.loadStoryDetail(storyId);

        const backButtonLink = document.getElementById('back-to-home-link');
        if (backButtonLink) {
            backButtonLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.hash = '/';
            });
        }

        const mainContent = document.querySelector('#main-content');
        const skipLink = document.querySelector('.skip-link');
        if (skipLink && mainContent) {
            skipLink.addEventListener('click', function (event) {
                event.preventDefault();
                skipLink.blur();
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                mainContent.scrollIntoView();
            });
        }
    }

    // Menampilkan detail story ke halaman
    showStoryDetail(story) {
        if (!story) {
            this.#storyDetailContainer.innerHTML = '<p class="error-message">Story tidak ditemukan.</p>';
            this.#storyPhotoContainer.innerHTML = '';
            if (this.#map) {
                this.#map.remove();
                this.#map = null;
            }
            if (this.#mapContainer) this.#mapContainer.innerHTML = '';
            return;
        }

        this.#storyPhotoContainer.innerHTML = `<img src="${story.photoUrl}" alt="${story.name}">`;

        this.#storyDetailContainer.innerHTML = `
            <h2><strong>${story.name}</strong></h2>
            <h3>${new Date(story.createdAt).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</h3>
            <h3>${story.lat !== null && story.lon !== null ? `Latitude: ${story.lat} | Longitude: ${story.lon}` : ''}</h3>
            <p>${story.description}</p>
            <p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</p>
        `;

        if (story.lat === null || story.lon === null) {
            if (this.#mapContainer) {
                this.#mapContainer.style.display = 'none';
                this.#mapContainer.innerHTML = '<p>Lokasi tidak tersedia.</p>';
            }
            if (this.#map) {
                this.#map.remove();
                this.#map = null;
            }
        } else {
            if (this.#mapContainer) {
                this.#mapContainer.style.display = 'flex';
                this.#mapContainer.innerHTML = '';
            }
            this.#renderMap(story);
        }
    }

    // Merender peta lokasi story
    async #renderMap(story) {
        if (!this.#mapContainer || story.lat === null || story.lon === null) return;

        if (!this.#map) {
            this.#map = await Map.build('#map-container', { zoom: 12, center: [story.lat, story.lon] });
        } else {
            this.#map.changeCamera([story.lat, story.lon], 12);
        }

        this.#map.addMarker([story.lat, story.lon], {}, {
            content: `<b>${story.name}</b><br>${story.description}`
        });
    }

    // Menampilkan loading saat data sedang dimuat
    showLoading() {
        if (this.#storyPhotoContainer) this.#storyPhotoContainer.innerHTML = '<p>Memuat Gambar...</p>';
        if (this.#storyDetailContainer) this.#storyDetailContainer.innerHTML = '<p>Memuat detail Story...</p>';
        if (this.#mapContainer) this.#mapContainer.innerHTML = '<p>Memuat peta...</p>';
    }

    // Menampilkan pesan error jika terjadi kesalahan
    showError(message) {
        if (this.#storyPhotoContainer) this.#storyPhotoContainer.innerHTML = '<p class="error-message">Gagal memuat gambar.</p>';
        if (this.#storyDetailContainer) this.#storyDetailContainer.innerHTML = `<p class="error-message">Terjadi kesalahan: ${message}</p>`;
        if (this.#mapContainer) this.#mapContainer.innerHTML = `<p class="error-message">Terjadi kesalahan memuat peta.</p>`;
    }

    // Merender tombol simpan story ke bookmark
    renderSaveButton() {
        document.getElementById('save-actions-container').innerHTML =
            generateSaveStoryButtonTemplate();

        document.getElementById('save-story-button').addEventListener('click', async () => {
            await this.#presenter.saveStoryToDatabase();
            // Panggil showSaveButton dengan ID story saat ini
            await this.#presenter.showSaveButton(this.#presenter.getCurrentStoryId());
        });
    }

    // Callback jika simpan ke bookmark berhasil
    saveToBookmarkSuccess(message) {
        window.showNotification && window.showNotification(message, false);
    };

    // Callback jika simpan ke bookmark gagal
    saveToBookmarkError(message) {
        window.showNotification && window.showNotification(message, true);
    };

    // Merender tombol hapus story dari bookmark
    renderRemoveButton() {
        document.getElementById('save-actions-container').innerHTML =
            generateRemoveStoryButtonTemplate();

        document.getElementById('remove-story-button').addEventListener('click', async () => {
            await this.#presenter.removeStoryFromDatabase();
            // Panggil showSaveButton dengan ID story saat ini
            await this.#presenter.showSaveButton(this.#presenter.getCurrentStoryId());
        });
    };

    // Callback jika hapus dari bookmark berhasil
    RemoveFromBookMarkSuccess(message) {
        window.showNotification && window.showNotification(message, false);
    }

    // Callback jika hapus dari bookmark gagal
    RemoveFromBookMarkError(message) {
        window.showNotification && window.showNotification(message, true);
    }
}

export default DetailStoryPage;