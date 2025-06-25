export default class CameraHandler {
    // Konstruktor untuk inisialisasi elemen video dan canvas
    constructor(videoElement, canvasElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.stream = null;
    }

    // Membuka kamera dan menampilkan stream ke elemen video
    async openCamera() {
        if (this.stream) return;
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            this.videoElement.srcObject = this.stream;
            if (!Array.isArray(window.currentStreams)) window.currentStreams = [];
            window.currentStreams.push(this.stream);
            this.videoElement.addEventListener('loadedmetadata', () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
            });
        } catch (error) {
            throw error;
        }
    }

    // Menghentikan kamera dan membersihkan stream
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
            if (Array.isArray(window.currentStreams)) {
                window.currentStreams = window.currentStreams.filter(s => s !== this.stream);
            }
            this.stream = null;
        }
    }

    // Mengambil gambar dari video dan mengembalikan file gambar
    captureImage() {
        if (!this.stream) throw new Error('Kamera belum aktif.');
        const context = this.canvasElement.getContext('2d');
        context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        const imageDataURL = this.canvasElement.toDataURL('image/png');
        const byteString = atob(imageDataURL.split(',')[1]);
        const mimeString = imageDataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new File([ab], 'captured_image.png', { type: mimeString });
    }

    // Menghentikan semua stream kamera yang aktif secara global
    static stopAllStreams() {
        if (!Array.isArray(window.currentStreams)) {
            window.currentStreams = [];
            return;
        }
        window.currentStreams.forEach(stream => {
            if (stream && typeof stream.getTracks === 'function') {
                stream.getTracks().forEach(track => track.stop());
            }
        });
        window.currentStreams = [];
    }
}