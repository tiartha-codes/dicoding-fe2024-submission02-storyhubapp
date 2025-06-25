import HomePresenter from './home-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';
import Map from '../../utils/maps.js';

class HomePage {
    #presenter = null;
    #storyListContainer = null;
    #mapContainer = null;
    #map = null;

    // Merender tampilan halaman home
    async render() {
        return `
        <a href="#main-content" class="skip-link">Skip to Content</a>
        <section class="home-page">
            <div id="map-container" class="map-container"></div>
            <h1>Story Terbaru</h1>
            <div id="story-list-container" class="story-list">
                <p>Memuat story terbaru...</p>
            </div>
            <div id="pagination"></div>
        </section>
        `;
    }

    // Dipanggil setelah elemen halaman dirender ke DOM
    async afterRender() {
        this.#storyListContainer = document.getElementById('story-list-container');
        this.#mapContainer = document.getElementById('map-container');
        this.#presenter = new HomePresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
        });

        // Skip to Content
        const mainContent = document.querySelector('#story-list-container');
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

        await this.#presenter.loadStories();

        // Panggil setupPaginationListener dari presenter setelah stories dimuat
        this.#presenter.setupPaginationListener();
    }

    // Menampilkan daftar story ke halaman
    showStories(stories, currentPage, totalPages) {
        if (!stories || stories.length === 0) {
            this.#storyListContainer.innerHTML = '<p>Belum ada story terbaru.</p>';
            if (this.#map) {
                this.#map.remove();
                this.#map = null;
            }
            return;
        }

        this.#storyListContainer.innerHTML = '';
        this.#renderMap(stories);

        stories.forEach((story, idx) => {
            const storyItem = document.createElement('div');
            storyItem.classList.add('story-item');
            storyItem.setAttribute('tabindex', idx + 1);
            storyItem.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}">
                <div class="story-info">
                    <h3>${story.name}</h3>
                    <p class="story-description">${story.description}</p>
                    <p class="story-date">${new Date(story.createdAt).toLocaleDateString()}</p>
                </div>
            `;
            storyItem.addEventListener('click', () => {
                window.location.hash = `/detail/${story.id}`;
            });
            storyItem.style.cursor = 'pointer';
            this.#storyListContainer.appendChild(storyItem);
        });

        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        if (currentPage > 1) {
            pagination.innerHTML += `<button data-page="${currentPage - 1}">Sebelumnya</button>`;
        }
        if (currentPage < totalPages) {
            pagination.innerHTML += `<button data-page="${currentPage + 1}">Berikutnya</button>`;
        }
    }

    // Merender peta lokasi story pada halaman home
    async #renderMap(stories) {
        if (!this.#mapContainer) return;

        if (!this.#map) {
            this.#map = await Map.build('#map-container', { zoom: 5 });
        } else {
            this.#map.changeCamera([-2.5489, 118.0149], 5);
        }

        stories.forEach(story => {
            if (story.lat !== null && story.lon !== null) {
                this.#map.addMarker([story.lat, story.lon], {}, {
                    content: `<b>${story.name}</b><br>${story.description}`
                });
            }
        });
    }

    // Menampilkan loading saat story sedang dimuat
    showLoadingStories() {
        this.#storyListContainer.innerHTML = '<p>Memuat Story terbaru...</p>';
        if (this.#mapContainer) this.#mapContainer.innerHTML = '<p>Memuat peta...</p>';
    }

    // Menampilkan pesan error jika gagal memuat story
    showErrorStories(message) {
        this.#storyListContainer.innerHTML = `<p class="error-message">Terjadi kesalahan memuat Story: ${message}</p>`;
        if (this.#mapContainer) this.#mapContainer.innerHTML = `<p class="error-message">Terjadi kesalahan memuat peta.</p>`;
    }
}

export default HomePage;