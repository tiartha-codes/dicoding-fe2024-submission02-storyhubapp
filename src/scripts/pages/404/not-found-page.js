class NotFoundPage {
  async render() {
    return `
      <section class="not-found-page container" style="text-align:center;padding:3em 1em;">
        <h1 style="font-size:3em;">404</h1>
        <p style="font-size:1.3em;">Halaman tidak ditemukan</p>
        <a href="#/" style="color:#3f51b5;text-decoration:underline;">Kembali ke Beranda</a>
      </section>
    `;
  }
  async afterRender() {}
}

export default NotFoundPage;
