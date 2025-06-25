// Presenter untuk mengelola logika login pada halaman login
export default class LoginPresenter {
    #view;
    #model;
    #authModel;

    // Konstruktor: inisialisasi presenter dengan view, model API, dan model autentikasi
    constructor({ view, model, authModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
    }

    // Fungsi utama untuk menangani proses login
    async getLogin({ email, password }) {
        this.#view.showSubmitLoadingButton();
        try {
            const response = await this.#model.getLogin({ email, password });
            if (!response.ok || response.error) {
                this.#view.loginFailed(response.message || 'Login gagal');
                return;
            }
            if (response.loginResult && response.loginResult.token) {
                this.#authModel.putAccessToken(response.loginResult.token);
            } else {
                this.#view.loginFailed('Login berhasil, tetapi token tidak ditemukan di dalam loginResult.');
                return;
            }
            this.#view.loginSuccessfully(response.message || 'Login berhasil', response.loginResult);
        } catch (error) {
            this.#view.loginFailed(error.message || 'Terjadi kesalahan saat mencoba login. Silakan coba lagi nanti.');
        } finally {
            this.#view.hideSubmitLoadingButton();
        }
    }
}