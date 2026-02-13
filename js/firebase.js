/**
 * firebase.js (ES Module)
 * Firebase initialization + helper functions for Storage & Firestore.
 * Exposes helpers on `window` so plain <script> files can use them.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyDwSKAyQRZvLS1vv3xW4WcjArutzAmO5Ms",
    authDomain: "inventory-4522d.firebaseapp.com",
    projectId: "inventory-4522d",
    storageBucket: "inventory-4522d.firebasestorage.app",
    messagingSenderId: "932096360302",
    appId: "1:932096360302:web:4c63305f276eecd7674b7f",
    measurementId: "G-YYC91TPGLR"
};

// --- Initialize Services ---
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Anonymous Auth (satisfies `request.auth != null` storage rules) ---
// This promise resolves once the user is signed in.
const authReady = signInAnonymously(auth)
    .then(() => console.log('[Firebase] Signed in anonymously.'))
    .catch(err => console.warn('[Firebase] Anonymous auth failed:', err));

// --- Helpers ---

/**
 * Format a Date as YYYY-MM-DD.
 */
function formatDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Format a Date as HH-MM-SS.
 */
function formatTime(d) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}-${mm}-${ss}`;
}

/**
 * Upload a raw CSV File to Firebase Storage.
 * Path: uploads/{type}/{YYYY-MM-DD}/{HH-MM-SS}_{filename}
 * Returns the download URL on success.
 *
 * @param {File} file - The File object from an <input type="file">
 * @param {string} type - Category folder, e.g. "inventory-order" or "usage-rates"
 * @returns {Promise<string>} Download URL
 */
async function uploadCSVToFirebase(file, type) {
    // Ensure auth is ready before uploading
    await authReady;

    const now = new Date();
    const datePath = formatDate(now);
    const timePart = formatTime(now);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `uploads/${type}/${datePath}/${timePart}_${safeName}`;

    const fileRef = storageRef(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
}

/**
 * Save a data object to a Firestore collection.
 * Automatically adds a `createdAt` server timestamp.
 *
 * @param {string} collectionName - Firestore collection, e.g. "inventory-results"
 * @param {Object} data - The document payload
 * @returns {Promise<string>} The new document ID
 */
async function saveToFirestore(collectionName, data) {
    // Ensure auth is ready before writing
    await authReady;

    const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp()
    });
    return docRef.id;
}

// --- Expose on window for non-module scripts ---
window.uploadCSVToFirebase = uploadCSVToFirebase;
window.saveToFirestore = saveToFirestore;

console.log('[Firebase] Initialized — Storage & Firestore ready.');
