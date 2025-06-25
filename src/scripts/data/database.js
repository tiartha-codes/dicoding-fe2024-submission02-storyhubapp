import { openDB } from 'idb';

const DATABASE_NAME = 'storyhubDb';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade: (database) => {
        database.createObjectStore(OBJECT_STORE_NAME, {
            keyPath: 'id',
        });
    },
});

const Database = {
    // Menyimpan story ke IndexedDB
    async saveStory(story) {
        if (!Object.hasOwn(story, 'id')) {
            throw new Error('`id` Story harus memiliki properti id.');
        }

        return (await dbPromise).put(OBJECT_STORE_NAME, story);
    },

    // Mengambil story berdasarkan id
    async getStoryById(id) {
        if (!id) {
            throw new Error('Story ID diperlukan untuk mengambil Story.');
        }

        return (await dbPromise).get(OBJECT_STORE_NAME, id);
    },

    // Mengambil semua story yang tersimpan
    async getAllStories() {
        return (await dbPromise).getAll(OBJECT_STORE_NAME);
    },

    // Menghapus story berdasarkan id
    async deleteStory(id) {
        if (!id) {
            throw new Error('Story ID diperlukan untuk menghapus Story.');
        }

        return (await dbPromise).delete(OBJECT_STORE_NAME, id);
    },
};

export default Database;