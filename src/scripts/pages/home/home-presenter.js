// Presenter untuk mengelola logika halaman home (beranda)
class HomePresenter {
    #view;
    #model;
    #authModel;
    #currentPage;

    // Konstruktor: inisialisasi presenter dengan view, model API, dan model autentikasi
    constructor({ view, model, authModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
        this.#currentPage = 1;
    }

    // Memuat daftar stories dari API
    async loadStories(page = 1) {
        this.#currentPage = page;
        this.#view.showLoadingStories();
        try {
            const token = this.#authModel.getAccessToken();
            if (!token) {
                this.#view.showErrorStories('Anda belum login.');
                window.showNotification && window.showNotification('Anda belum login.', true);
                return;
            }
            const response = await this.#model.getAllStories(page, 12);
            if (!response.error) {
                this.#view.showStories(response.listStory, page, response.totalPages);
            } else {
                this.#view.showErrorStories(response.message || 'Gagal memuat Story terbaru.');
                window.showNotification && window.showNotification(response.message || 'Gagal memuat Story terbaru.', true);
            }
        } catch (error) {
            this.#view.showErrorStories('Terjadi kesalahan saat memuat Story terbaru.');
            window.showNotification && window.showNotification('Terjadi kesalahan saat memuat Story terbaru.', true);
        }
    }

    // Menambahkan story baru dari halaman home
    async addNewStory(data) {
        this.#view.showLoadingNewStory();
        try {
            const token = this.#authModel.getAccessToken();
            if (!token) {
                this.#view.showMessage('Anda belum login.', true);
                return;
            }

            const formData = new FormData();
            formData.append('description', data.description);
            formData.append('photo', data.photo);
            if (data.lat !== null) formData.append('lat', data.lat);
            if (data.lon !== null) formData.append('lon', data.lon);

            const response = await this.#model.addNewStory(formData);

            if (!response.error) {
                this.#view.showMessage('Story berhasil dibagikan!');
                this.#view.clearNewStoryForm();
                await this.loadStories();

                if ('serviceWorker' in navigator && window.serviceWorkerRegistration) {
                    const notificationData = {
                        title: 'Story berhasil dibuat',
                        options: {
                            body: `Anda telah membuat story baru dengan deskripsi: ${data.description}`
                        }
                    };
                    window.serviceWorkerRegistration.showNotification(notificationData.title, notificationData.options);
                }

            } else {
                this.#view.showMessage(response.message || 'Gagal membagikan Story.', true);
            }
        } catch (error) {
            this.#view.showMessage('Terjadi kesalahan saat mencoba membagikan Story.', true);
        } finally {
            this.#view.hideLoadingNewStory();
        }
    }

    // Menambahkan event listener untuk pagination
    setupPaginationListener() {
        const paginationElement = document.getElementById('pagination');
        if (!paginationElement) return;
        paginationElement.addEventListener('click', (event) => {
            if (event.target.dataset.page) {
                this.loadStories(Number(event.target.dataset.page));
            }
        });
    }
}

export default HomePresenter;