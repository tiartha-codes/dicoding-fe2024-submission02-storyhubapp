// Presenter untuk mengelola logika penambahan story baru pada halaman new story
class NewStoryPresenter {
    #view;
    #model;
    #authModel;

    // Konstruktor: inisialisasi presenter dengan view, model API, dan model autentikasi
    constructor({ view, model, authModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
    }

    // Menambahkan story baru ke server
    async addNewStory(data) {
        this.#view.showLoading();
        try {
            const token = this.#authModel.getAccessToken();
            if (!token) {
                this.#view.showMessage('Anda belum login.', true);
                window.showNotification && window.showNotification('Anda belum login.', true);
                return;
            }

            const formData = new FormData();
            formData.append('description', data.description);
            formData.append('photo', data.photo);
            if (typeof data.lat === 'number' && !isNaN(data.lat)) formData.append('lat', data.lat);
            if (typeof data.lon === 'number' && !isNaN(data.lon)) formData.append('lon', data.lon);

            const response = await this.#model.addNewStory(formData);
            if (!response.error) {
                this.#view.showMessage('Story berhasil dibagikan!');
            } else {
                this.#view.showMessage(response.message || 'Gagal membagikan Story.', true);
                window.showNotification && window.showNotification(response.message || 'Gagal membagikan Story.', true);
            }
        } catch (error) {
            this.#view.showMessage('Terjadi kesalahan saat mencoba membagikan Story.', true);
            window.showNotification && window.showNotification('Terjadi kesalahan saat mencoba membagikan Story.', true);
        } finally {
            this.#view.hideLoading();
        }
    }
}

export default NewStoryPresenter;