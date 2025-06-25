import LoginPresenter from './login-presenter.js';
import * as StoryHubAPI from '../../../data/api.js';
import * as AuthModel from '../../../utils/util-auth.js';

export default class LoginPage {
    #presenter = null;

    // Merender tampilan halaman login
    async render() {
        return `
            <section class="login-container">
                <article class="login-form-container">
                    <h1 class="login__title">Please Login</h1>

                    <form id="login-form" class="login-form">
                        <div class="form-control">
                            <label for="email-input" class="login-form__email-title">Email</label>

                            <div class="login-form__title-container">
                                <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com">
                            </div>
                        </div>
                        <div class="form-control">
                            <label for="password-input" class="login-form__password-title">Password</label>

                            <div class="login-form__title-container">
                                <input id="password-input" type="password" name="password" placeholder="Masukkan password Anda">
                            </div>
                        </div>
                        <div class="form-buttons login-form__form-buttons">
                            <div id="submit-button-container">
                                <button class="login-btn" type="submit">Masuk</button>
                            </div>
                            <p class="login-form__do-not-have-account">Belum punya akun? <a href="#/register">Daftar</a></p>
                        </div>
                    </form>
                </article>
            </section>
        `;
    }

    // Dipanggil setelah elemen halaman dirender ke DOM
    async afterRender() {
        this.#presenter = new LoginPresenter({
            view: this,
            model: StoryHubAPI,
            authModel: AuthModel,
        });

        this.#setupForm();
    }

    // Meng-setup event handler untuk form login
    #setupForm() {
        document.getElementById('login-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const data = {
                email: document.getElementById('email-input').value,
                password: document.getElementById('password-input').value,
            };
            await this.#presenter.getLogin(data);
        });
    }

    // Callback jika login berhasil, redirect ke halaman home
    loginSuccessfully(message, loginResult) {
        window.location.hash = '/';
    }

    // Callback jika login gagal, tampilkan pesan error
    loginFailed(message) {
        alert(message);
    }

    // Menampilkan tombol submit loading saat proses login
    showSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="login-btn" type="submit" disabled>
                <i class="fas fa-spinner loader-button"></i> Masuk
            </button>
        `;
    }

    // Mengembalikan tombol submit ke kondisi normal
    hideSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="login-btn" type="submit">Masuk</button>
        `;
    }
}