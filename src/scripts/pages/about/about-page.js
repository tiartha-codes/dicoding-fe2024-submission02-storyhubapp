import AboutPresenter from './about-presenter.js';
import { getAccessToken } from '../../utils/util-auth.js';

// Komponen halaman About untuk Story Hub
class AboutPage {
  #presenter = null;

  // Merender tampilan awal halaman About
  async render() {
    return `
      <a href="#main-content-about" class="skip-link">Skip to Content</a>
       <section class="about-page">
        <h1>Tentang Story Hub</h1>
        <p class="tagline">Menghubungkan Dunia Melalui Setiap Narasi</p>
        <div class="about-content container">
          <div class="about-section about-intro">
            <p><strong>Story Hub</strong> adalah platform inovatif yang memungkinkan pengguna untuk berbagi dan menjelajahi berbagai story menarik dari seluruh dunia.
            Dengan antarmuka yang sederhana dan intuitif, Anda dapat dengan mudah mengunggah story Anda sendiri, berinteraksi dengan cerita orang lain, dan menemukan konten baru yang akan menginspirasi dan menghibur Anda.</p>
          </div>
          <div class="about-image-section">
            <img class="about-page-image" src="/images/storyhub-about.jpg" alt="Sekelompok orang berinteraksi dengan gembira, melambangkan komunitas Story Hub.">
          </div>
          <div class="about-section about-mission">
            <h2>Misi Kami</h2>
            <p>Misi kami adalah untuk menghubungkan orang-orang melalui narasi yang kuat dan beragam, menciptakan ruang di mana setiap cerita memiliki kesempatan untuk didengar.</p>
            <p>Kami berkomitmen untuk terus mengembangkan Story Hub dengan fitur-fitur baru dan menarik, serta menjaga komunitas yang positif dan suportif bagi semua pengguna. Kami percaya bahwa setiap individu memiliki cerita untuk dibagikan, dan Story Hub hadir untuk mewujudkan hal tersebut.</p>
          </div>
          <div class="about-section about-cta"  id="about-cta">
            <h2>Bergabunglah Dengan Kami!</h2>
            <p>Siap untuk berbagi kisah Anda atau menjelajahi cerita orang lain? <a href="#/register" class="about-cta-button">Daftar Sekarang</a></p>
            <p class="register-form__already-have-account">Apakah anda sudah memiliki akun? <a href="#/login" class="about-login-button">Login</a></p>
          </div>
        </div>
      </section>
    `;
  }

  // Menjalankan logic setelah elemen dirender ke DOM
  async afterRender() {
    this.#presenter = new AboutPresenter({ view: this });

    // Sembunyikan CTA jika sudah login
    const ctaSection = document.getElementById('about-cta');
    if (getAccessToken() && ctaSection) {
      ctaSection.style.display = 'none';
    }

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
  }

}

export default AboutPage;
