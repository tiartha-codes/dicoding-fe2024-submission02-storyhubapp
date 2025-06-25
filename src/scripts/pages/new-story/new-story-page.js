import NewStoryPresenter from './new-story-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';
import Map from '../../utils/maps.js';
import 'leaflet/dist/leaflet.css';
import CameraHandler from '../../utils/camera.js';

class NewStoryPage {
    #presenter = null;
    #descriptionInput = null;
    #photoSourceSelect = null;
    #photoInputFile = null;
    #cameraPreviewContainer = null;
    #cameraVideoElement = null;
    #captureButton = null;
    #cameraCanvasElement = null;
    #locationCheckbox = null;
    #latInput = null;
    #lonInput = null;
    #submitButton = null;
    #messageContainer = null;
    #mapContainer = null;
    #map = null;
    #locationMarker = null;
    #cameraHandler = null;

    // Merender tampilan halaman new story
    async render() {
        return `
            <section class="new-story-page">
                <h1>Bagikan Story Baru</h1>
                <div class="form-group">
                    <label for="description">Deskripsi:</label>
                    <textarea id="description" placeholder="Tuliskan Story Anda di sini..."></textarea>
                </div>
                <div class="form-group">
                    <label for="photo-source">Pilih Sumber Foto:</label>
                    <select id="photo-source">
                        <option value="media">Galeri/File</option>
                        <option value="camera">Kamera</option>
                    </select>
                </div>
                <div id="media-upload" class="form-group">
                    <label for="photo-file">Foto:</label>
                    <input type="file" id="photo-file" accept="image/*">
                    <small class="form-text">Format: JPG, JPEG, PNG. Ukuran maksimal 1MB.</small>
                </div>
                <div id="camera-input" class="camera-input hidden">
                    <div id="camera-preview" class="camera-preview">
                        <video id="camera-video" autoplay></video>
                    </div>
                    <button id="capture-btn" class="capture-btn hidden">Ambil Foto</button>
                    <canvas id="camera-canvas" style="display:none;"></canvas>
                </div>
                <div class="form-group location-checkbox">
                    <input type="checkbox" id="location">
                    <label for="location">Tambahkan Lokasi (Opsional)</label>
                </div>
                <div class="location-inputs hidden">
                    <div id="map-container" class="map-container-new"></div>
                    <div class="form-group">
                        <label for="latitude">Latitude:</label>
                        <input type="number" id="latitude" placeholder="Contoh: -6.2088" readonly>
                    </div>
                    <div class="form-group">
                        <label for="longitude">Longitude:</label>
                        <input type="number" id="longitude" placeholder="Contoh: 106.8456" readonly>
                    </div>
                    <small class="form-text">Pilih lokasi dengan mengklik peta.</small>
                </div>
                <div class="form-group">
                    <button id="submit-new-story" class="btn-new">Bagikan</button>
                    <div id="message-container" class="message-container"></div>
                </div>
            </section>
        `;
    }

    // Dipanggil setelah elemen halaman dirender ke DOM
    async afterRender() {
        this.#descriptionInput = document.getElementById('description');
        this.#photoSourceSelect = document.getElementById('photo-source');
        this.#photoInputFile = document.getElementById('photo-file');
        this.#cameraPreviewContainer = document.getElementById('camera-preview');
        this.#cameraVideoElement = document.getElementById('camera-video');
        this.#captureButton = document.getElementById('capture-btn');
        this.#cameraCanvasElement = document.getElementById('camera-canvas');

        this.#locationCheckbox = document.getElementById('location');
        this.#latInput = document.getElementById('latitude');
        this.#lonInput = document.getElementById('longitude');
        this.#submitButton = document.getElementById('submit-new-story');
        this.#messageContainer = document.getElementById('message-container');
        this.#mapContainer = document.getElementById('map-container');

        this.#presenter = new NewStoryPresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
        });

        this.#cameraHandler = new CameraHandler(this.#cameraVideoElement, this.#cameraCanvasElement);

        this.#photoSourceSelect.addEventListener('change', this.#handlePhotoSourceChange);
        this.#captureButton.addEventListener('click', this.#captureImage);
        this.#locationCheckbox.addEventListener('change', this.#toggleLocationInputs);
        this.#submitButton.addEventListener('click', this.#submitNewStory);

        this.#renderMap();
        this.#handlePhotoSourceChange();

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

    // Mengatur tampilan input foto berdasarkan sumber yang dipilih
    #handlePhotoSourceChange = () => {
        const selectedSource = this.#photoSourceSelect.value;
        const mediaUploadDiv = document.getElementById('media-upload');
        const cameraInputDiv = document.getElementById('camera-input');

        if (selectedSource === 'media') {
            mediaUploadDiv.classList.remove('hidden');
            cameraInputDiv.classList.add('hidden');
            this.#cameraHandler.stopCamera();
            this.#captureButton.classList.add('hidden');
        } else if (selectedSource === 'camera') {
            mediaUploadDiv.classList.add('hidden');
            cameraInputDiv.classList.remove('hidden');
            this.#cameraHandler.openCamera().catch((error) => {
                this.showMessage('Gagal membuka kamera.', true);
                this.#photoSourceSelect.value = 'media';
                this.#handlePhotoSourceChange();
            });
            this.#captureButton.classList.remove('hidden');
        }
    };

    // Menangani proses pengambilan gambar dari kamera
    #captureImage = () => {
        try {
            const capturedFile = this.#cameraHandler.captureImage();
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(capturedFile);
            this.#photoInputFile.files = dataTransfer.files;
            this.#cameraHandler.stopCamera();
            this.#photoSourceSelect.value = 'media';
            this.#handlePhotoSourceChange();
            this.showMessage('Foto berhasil diambil.');
        } catch (e) {
            this.showMessage('Kamera belum aktif.', true);
        }
    };

    // Merender peta lokasi untuk input koordinat
    async #renderMap() {
        if (!this.#mapContainer) return;
        if (!this.#map) {
            this.#map = await Map.build('#map-container', { zoom: 5 });
            this.#setupMapClick();
        } else {
            this.#setupMapClick();
        }
    }

    // Mengatur event klik pada peta untuk memilih lokasi
    #setupMapClick() {
        if (!this.#map) return;
        if (this.#locationMarker) {
            this.#map.removeLayer(this.#locationMarker);
            this.#locationMarker = null;
        }
        this.#map.addMapEventListener('click', (e) => {
            const { lat, lng } = e.latlng;
            this.#latInput.value = lat;
            this.#lonInput.value = lng;
            if (this.#locationMarker) {
                this.#map.removeLayer(this.#locationMarker);
            }
            this.#locationMarker = this.#map.addMarker([lat, lng]);
        });
    }

    // Menampilkan/menyembunyikan input lokasi
    #toggleLocationInputs = () => {
        const locationInputs = document.querySelector('.location-inputs');
        locationInputs.classList.toggle('hidden');
        if (this.#locationCheckbox.checked && !this.#map) {
            this.#renderMap();
        }
    };

    // Menangani submit form story baru
    #submitNewStory = async () => {
        if (!this.#descriptionInput.value.trim()) {
            this.showMessage('Deskripsi tidak boleh kosong.', true);
            return;
        }

        const file = this.#photoInputFile.files[0];
        if (!file) {
            this.showMessage('Foto harus diunggah.', true);
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            this.showMessage('Format foto yang didukung adalah JPG, JPEG, dan PNG.', true);
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            this.showMessage('Ukuran foto maksimal 1MB.', true);
            return;
        }

        const data = {
            description: this.#descriptionInput.value,
            photo: file,
            lat: this.#locationCheckbox.checked ? parseFloat(this.#latInput.value) || null : null,
            lon: this.#locationCheckbox.checked ? parseFloat(this.#lonInput.value) || null : null,
        };

        this.#presenter.addNewStory(data);
    };

    // Menampilkan pesan sukses/error pada form
    showMessage(message, isError = false) {
        this.#messageContainer.textContent = message;
        this.#messageContainer.className = `message-container ${isError ? 'error' : 'success'}`;

        if (!isError && message === 'Story berhasil dibagikan!') {
            setTimeout(() => {
                window.location.hash = '/';
            }, 1200);
        }
    }

    // Mengosongkan form setelah story berhasil dibagikan
    clearNewStoryForm() {
        this.#descriptionInput.value = '';
        this.#photoSourceSelect.value = 'media';
        this.#handlePhotoSourceChange();
        this.#photoInputFile.value = '';
        this.#cameraHandler.stopCamera();
        this.#locationCheckbox.checked = false;
        document.querySelector('.location-inputs').classList.add('hidden');
        this.#latInput.value = '';
        this.#lonInput.value = '';
        this.#messageContainer.textContent = '';
        this.#messageContainer.className = 'message-container';
        if (this.#locationMarker && this.#map) {
            this.#map.removeMarker(this.#locationMarker);
            this.#locationMarker = null;
        }
        if (this.#map) {
            this.#map.changeCamera([-2.5489, 118.0149], 5);
        }
    }

    // Menampilkan loading pada tombol submit
    showLoading() {
        this.#submitButton.textContent = 'Mengunggah...';
        this.#submitButton.disabled = true;
    }

    // Mengembalikan tombol submit ke kondisi normal
    hideLoading() {
        this.#submitButton.textContent = 'Bagikan Story';
        this.#submitButton.disabled = false;
    }
}

export default NewStoryPage;