// Presenter untuk mengelola logika registrasi pada halaman register
export default class RegisterPresenter {
    #view;
    #model;

    // Konstruktor: inisialisasi presenter dengan view dan model API
    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    // Fungsi utama untuk menangani proses registrasi
    async getRegistered({ name, email, password }) {
        this.#view.showSubmitLoadingButton();
        try {
            const response = await this.#model.getRegistered({ name, email, password });
            if (!response.ok) {
                this.#view.registeredFailed(response.message);
                return;
            }
            this.#view.registeredSuccessfully(response.message, response.data);
        } catch (error) {
            this.#view.registeredFailed(error.message);
        } finally {
            this.#view.hideSubmitLoadingButton();
        }
    }
}
