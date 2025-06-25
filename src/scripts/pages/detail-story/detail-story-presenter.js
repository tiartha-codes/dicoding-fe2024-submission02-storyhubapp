import Database from "../../data/database.js";

class DetailStoryPresenter {
    #view;
    #model;
    #authModel;
    #dbModel;
    #currentStory = null;

    // Konstruktor: inisialisasi presenter dengan view, model, authModel, dan dbModel
    constructor({ view, model, authModel, dbModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
        this.#dbModel = dbModel;
    };

    // Memuat detail story berdasarkan storyId
    async loadStoryDetail(storyId) {
        this.#view.showLoading();
        try {
            const token = this.#authModel.getAccessToken();
            if (!token) {
                this.#view.showError('Anda belum login.');
                window.showNotification && window.showNotification('Anda belum login.', true);
                return;
            }

            const response = await this.#model.getStoryDetail(storyId);
            console.log('DetailStoryPresenter: Respons dari getStoryDetail:', response);

            if (!response.error) {
                this.#currentStory = response.story;
                this.#view.showStoryDetail(response.story);
                await this.showSaveButton(storyId);
            } else {
                this.#view.showError(response.message || 'Gagal memuat detail Story.');
                window.showNotification && window.showNotification(response.message || 'Gagal memuat detail Story.', true);
            }
        } catch (error) {
            console.error('DetailStoryPresenter: Terjadi kesalahan saat memuat detail Story:', error);
            this.#view.showError('Terjadi kesalahan saat memuat detail Story.');
            window.showNotification && window.showNotification('Terjadi kesalahan saat memuat detail Story.', true);
        };
    };

    // Menyimpan story ke database offline
    async saveStoryToDatabase() {
        try {
            if (!this.#currentStory) throw new Error('Story belum dimuat.');
            await this.#dbModel.saveStory(this.#currentStory);
            this.#view.saveToBookmarkSuccess('Story berhasil disimpan ke bookmark.');
        } catch (error) {
            console.error('DetailStoryPresenter: Terjadi kesalahan saat menyimpan story:', error);
            this.#view.showError('Terjadi kesalahan saat menyimpan story.');
            this.#view.saveToBookmarkError('Gagal menyimpan story ke bookmark.');
        };
    };

    // Menghapus story dari database offline
    async removeStoryFromDatabase() {
        try {
            if (!this.#currentStory) throw new Error('Story belum dimuat.');
            await this.#dbModel.deleteStory(this.#currentStory.id);
            this.#view.RemoveFromBookMarkSuccess('Story berhasil dihapus dari bookmark.');
        } catch (error) {
            console.error('DetailStoryPresenter: Terjadi kesalahan saat menghapus story:', error);
            this.#view.showError('Terjadi kesalahan saat menghapus story.');
            this.#view.RemoveFromBookMarkError('Gagal menghapus story dari bookmark.');
        };
    };

    // Menampilkan tombol simpan/hapus bookmark sesuai status
    async showSaveButton(storyId) {
        // Gunakan #currentStory.id jika storyId tidak diberikan
        const currentId = storyId || (this.#currentStory ? this.#currentStory.id : null);
        if (await this.#isStorySaved(currentId)) {
            this.#view.renderRemoveButton();
            return;
        }
        this.#view.renderSaveButton();
    };

    // Mengecek apakah story sudah tersimpan di database offline
    async #isStorySaved(storyId) {
        if (!storyId) return false;
        return !!(await this.#dbModel.getStoryById(storyId));
    };

    // Getter untuk mengambil id story yang sedang aktif
    getCurrentStoryId() {
        return this.#currentStory ? this.#currentStory.id : null;
    }
}

export default DetailStoryPresenter;