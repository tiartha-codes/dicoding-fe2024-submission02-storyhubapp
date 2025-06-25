// presenters/bookmark-presenter.js

class BookmarkPresenter {
    #view;
    #dbModel;

    // Konstruktor: inisialisasi presenter dengan view dan dbModel
    constructor({ view, dbModel }) {
        this.#view = view;
        this.#dbModel = dbModel;
    }

    // Memuat dan menampilkan semua story yang tersimpan
    async loadSavedStories() {
        this.#view.showLoading();
        try {
            const stories = await this.#dbModel.getAllStories();
            this.#view.showSavedStories(stories);
        } catch (error) {
            this.#view.showError('Gagal memuat story tersimpan.');
            window.showNotification && window.showNotification('Terjadi kesalahan saat memuat story tersimpan.', true);
        }
    }

    // Menghapus story dari bookmark berdasarkan id
    async removeStoryFromBookmark(id) {
        try {
            await this.#dbModel.deleteStory(id);
            this.#view.deleteSuccess('Story berhasil dihapus dari bookmark.');
            await this.loadSavedStories();
        } catch (error) {
            this.#view.deleteError('Gagal menghapus story dari bookmark.');
            window.showNotification && window.showNotification('Terjadi kesalahan saat menghapus story dari bookmark.', true);
        }
    }
}

export default BookmarkPresenter;