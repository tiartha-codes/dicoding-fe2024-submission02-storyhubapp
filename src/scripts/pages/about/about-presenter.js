// Kelas presenter untuk mengelola logika halaman About (Tentang)
class AboutPresenter {
    #view;

    // Konstruktor: inisialisasi dengan objek view
    constructor({ view }) {
        this.#view = view;
    }

    // Memuat dan menampilkan informasi tentang aplikasi ke view
    async loadAboutInfo() {
        this.#view.showLoading();
        try {
            const aboutDescription = `
                Story Hub adalah platform inovatif yang memungkinkan pengguna untuk berbagi dan menjelajahi berbagai story menarik dari seluruh dunia. <br> 
                Misi kami adalah untuk menghubungkan orang-orang melalui narasi yang kuat dan beragam, menciptakan ruang di mana setiap cerita memiliki kesempatan untuk didengar. <br> 
                Dengan antarmuka yang sederhana dan intuitif, Anda dapat dengan mudah mengunggah story Anda sendiri, berinteraksi dengan cerita orang lain, dan menemukan konten baru yang akan menginspirasi dan menghibur Anda.<br>
                Kami berkomitmen untuk terus mengembangkan Story Hub dengan fitur-fitur baru dan menarik, serta menjaga komunitas yang positif dan suportif bagi semua pengguna.
            `;

            // Simulasi pemanggilan API (jika Anda ingin mengambil dari server)
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay singkat untuk simulasi loading

            this.#view.showAboutInfo(aboutDescription);

        } catch (error) {
            console.error('AboutPresenter: Gagal memuat informasi tentang:', error);
            this.#view.showError('Gagal memuat informasi tentang aplikasi.');
        }
    }
}

export default AboutPresenter;