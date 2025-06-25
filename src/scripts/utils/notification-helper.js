import { convertBase64ToUint8Array } from './index.js';
import { VAPID_PUBLIC_KEY } from '../config.js';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api.js';

// Mengecek apakah Notification API tersedia di browser
export function isNotificationAvailable() {
    return 'Notification' in window;
}

// Mengecek apakah izin notifikasi sudah diberikan
export function isNotificationGranted() {
    return Notification.permission === 'granted';
}

// Meminta izin notifikasi ke pengguna
export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
        console.error('Notification API unsupported.');
        window.showNotification && window.showNotification('Notifikasi tidak didukung oleh browser Anda.', true);
        return false;
    }

    if (isNotificationGranted()) {
        return true;
    }

    const status = await Notification.requestPermission();

    if (status === 'denied') {
        window.showNotification && window.showNotification('Izin notifikasi ditolak.', true);
        return false;
    }

    if (status === 'default') {
        window.showNotification && window.showNotification('Izin notifikasi ditutup atau diabaikan.', true);
        return false;
    }

    return true;
}

// Mengambil push subscription aktif dari service worker
export async function getPushSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    return await registration.pushManager.getSubscription();
}

// Mengecek apakah sudah ada push subscription aktif
export async function isCurrentPushSubscriptionAvailable() {
    return !!(await getPushSubscription());
}

// Membuat opsi untuk subscribe push notification
export function generateSubscribeOptions() {
    return {
        userVisibleOnly: true,
        applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
    };
}

// Melakukan subscribe push notification
export async function subscribe() {
    if (!(await requestNotificationPermission())) {
        return;
    }

    if (await isCurrentPushSubscriptionAvailable()) {
        window.showNotification && window.showNotification('Anda sudah berlangganan push notification.', false);
        return;
    }

    console.log('Mulai berlangganan push notification...');
    const failureSubscriptionMessage = 'Gagal mengaktifkan push notification!';
    const successSubscriptionMessage = 'Berhasil mengaktifkan langganan push notification!';

    let pushSubscription = null;

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

        const { endpoint, keys } = pushSubscription.toJSON();
        const response = await subscribePushNotification({ endpoint, keys });

        if (!response.ok) {
            console.error('subscribe: response:', response);
            window.showNotification && window.showNotification(failureSubscriptionMessage, true);
            if (pushSubscription) {
                await pushSubscription.unsubscribe();
            }
            return;
        }

        window.showNotification && window.showNotification(successSubscriptionMessage, false);
    } catch (error) {
        console.error('subscribe: error', error);
        window.showNotification && window.showNotification(failureSubscriptionMessage, true);
        if (pushSubscription) {
            await pushSubscription.unsubscribe();
        }
    }
}

// Melakukan unsubscribe push notification
export async function unsubscribe() {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
        window.showNotification && window.showNotification('Anda belum berlangganan push notification.', false);
        return;
    }

    const { endpoint } = pushSubscription.toJSON();
    let response;
    try {
        response = await unsubscribePushNotification({ endpoint });
    } catch (error) {
        console.error('unsubscribe: error during API call', error);
        window.showNotification && window.showNotification('Terjadi kesalahan saat mencoba berhenti berlangganan.', true);
        await pushSubscription.unsubscribe();
        return;
    }

    await pushSubscription.unsubscribe();

    if (response.ok) {
        window.showNotification && window.showNotification('Berhasil berhenti berlangganan push notification!', false);
    } else {
        window.showNotification && window.showNotification('Gagal berhenti berlangganan push notification!', true);
    }
}