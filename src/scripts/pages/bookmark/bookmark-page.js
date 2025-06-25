// pages/bookmark/bookmark-page.js
import BookmarkPresenter from './bookmark-presenter.js';
import Database from '../../data/database.js';
import { showNotification } from '../../utils';

class BookmarkPage {
    #presenter = null;
    #storyListContainer = null;

    // Merender tampilan halaman bookmark
    async render() {
        return `
            <a href="#main-content" class="skip-link">Skip to Content</a>
            <section class="bookmark-page">
                <h1>Story Tersimpan (Offline)</h1>
                <div id="main-content" class="container">
                    <div id="bookmark-story-list-container" class="story-list">
                        <p>Memuat story yang tersimpan...</p>
                    </div>
                </div>
            </section>
        `;
    }

    // Dipanggil setelah elemen halaman dirender ke DOM
    async afterRender() {
        this.#storyListContainer = document.getElementById('bookmark-story-list-container');

        this.#presenter = new BookmarkPresenter({
            view: this,
            dbModel: Database,
        });

        // Skip to Content
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

        await this.#presenter.loadSavedStories();
    }

    // Menampilkan daftar story ke dalam kontainer
    showSavedStories(stories) {
        if (!stories || stories.length === 0) {
            this.#storyListContainer.innerHTML = '<p>Tidak ada story offline yang tersimpan.</p>';
            return;
        }

        this.#storyListContainer.innerHTML = '';
        stories.forEach((story, idx) => {
            const storyItem = document.createElement('div');
            storyItem.classList.add('story-item', 'offline-bookmark');
            storyItem.setAttribute('tabindex', idx + 1);
            const fallbackImg = '/images/fallback-image.png';
            storyItem.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}" onerror="this.onerror=null;this.src='${fallbackImg}';">
                <div class="story-info">
                    <h3>${story.name}</h3>
                    <p class="story-description">${story.description}</p>
                    <p class="story-date">${new Date(story.createdAt).toLocaleDateString()}</p>
                    <button class="delete-bookmark-story-btn" data-id="${story.id}">Hapus Story</button>
                    <a href="#/detail/${story.id}" class="view-detail-bookmark-btn">Lihat Detail</a>
                </div>
            `;
            this.#storyListContainer.appendChild(storyItem);
        });

        this.#storyListContainer.querySelectorAll('.delete-bookmark-story-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                await this.#presenter.removeStoryFromBookmark(id);
            });
        });

        this.#storyListContainer.querySelectorAll('.view-detail-bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    // Menampilkan loading saat data sedang dimuat
    showLoading() {
        this.#storyListContainer.innerHTML = '<p>Memuat story yang tersimpan...</p>';
    }

    // Menampilkan pesan error jika terjadi kesalahan
    showError(message) {
        this.#storyListContainer.innerHTML = `<p class="error-message">Terjadi kesalahan: ${message}</p>`;
    }

    // Callback jika hapus story berhasil
    deleteSuccess(message) {
        window.showNotification && window.showNotification(message, false);
    }

    // Callback jika hapus story gagal
    deleteError(message) {
        window.showNotification && window.showNotification(message, true);
    }
}

export default BookmarkPage;