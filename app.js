import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBvdFAKO1hcC70kTd3BbiuskVJH9XTDtWs",
    authDomain: "trinity-logistics-b076c.firebaseapp.com",
    projectId: "trinity-logistics-b076c",
    storageBucket: "trinity-logistics-b076c.firebasestorage.app",
    messagingSenderId: "700729435351",
    appId: "1:700729435351:web:5cc00ea239cd87259efc92",
    measurementId: "G-20DY9C2Q1N"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const trackBtn      = document.getElementById('track-btn');
const trackingInput = document.getElementById('tracking-id-input');
const resultCard    = document.getElementById('tracking-result');
const errorMsg      = document.getElementById('error-message');

trackBtn.addEventListener('click', performTracking);
trackingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performTracking();
});

async function performTracking() {
    const raw = trackingInput.value.trim().toUpperCase();

    resultCard.classList.add('hidden');
    errorMsg.classList.add('hidden');
    trackBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Searching…`;
    trackBtn.disabled = true;

    if (!raw) { resetBtn(); return; }

    // Accept with or without TRINITY- prefix
    const trackingId = raw.startsWith('TRINITY-') ? raw : `TRINITY-${raw}`;

    try {
        const docSnap = await getDoc(doc(db, "luggage", trackingId));

        if (docSnap.exists()) {
            renderTrackingDetails(trackingId, docSnap.data());
        } else {
            showError("Tracking ID not found. Please verify and try again.");
        }
    } catch (err) {
        console.error(err);
        showError("Network error. Please try again later.");
    } finally {
        resetBtn();
    }
}

function renderTrackingDetails(id, d) {
    // Tracking ID & package
    document.getElementById('res-id').innerText          = id;
    document.getElementById('res-description').innerText = `${d.description || 'N/A'} (${d.weight || '—'})`;

    // Status banner
    const banner   = document.getElementById('status-banner');
    const iconBox  = document.getElementById('status-icon-box');
    const statusEl = document.getElementById('res-status-badge');
    const icon     = document.getElementById('status-icon');

    banner.className = 'status-banner';
    statusEl.innerText = d.status || 'Registered';

    if (d.status === 'Delivered') {
        banner.classList.add('s-delivered');
        icon.className = 'fa-solid fa-circle-check';
    } else if (d.status === 'In Transit') {
        banner.classList.add('s-transit');
        icon.className = 'fa-solid fa-truck-fast';
    } else {
        banner.classList.add('s-registered');
        icon.className = 'fa-solid fa-box';
    }

    // Courier
    document.getElementById('res-courier-name').innerText  = d.courierName  || 'Unassigned';
    document.getElementById('res-courier-phone').innerHTML = `<i class="fa-solid fa-phone"></i> ${d.courierPhone || '—'}`;

    // Sender
    document.getElementById('res-sender-name').innerText       = d.senderName       || '—';
    document.getElementById('res-sender-phone').innerText      = d.senderPhone      || '—';
    document.getElementById('res-sender-email').innerText      = d.senderEmail      || '—';
    document.getElementById('res-sender-address').innerText    = d.senderAddress    || '—';
    document.getElementById('res-sender-city').innerText       = d.senderCity       || '—';
    document.getElementById('res-sender-country').innerText    = d.senderCountry    || '—';
    document.getElementById('res-sender-occupation').innerText = d.senderOccupation || '—';

    // Recipient
    document.getElementById('res-recipient-name').innerText         = d.recipientName         || '—';
    document.getElementById('res-recipient-phone').innerText        = d.recipientPhone        || '—';
    document.getElementById('res-recipient-email').innerText        = d.recipientEmail        || '—';
    document.getElementById('res-recipient-address').innerText      = d.recipientAddress      || '—';
    document.getElementById('res-recipient-city').innerText         = d.recipientCity         || '—';
    document.getElementById('res-recipient-country').innerText      = d.recipientCountry      || '—';
    document.getElementById('res-recipient-occupation').innerText   = d.recipientOccupation   || '—';
    document.getElementById('res-relationship').innerText           = d.recipientRelationship || '—';

    // Timeline steps
    ['step-registered', 'step-transit', 'step-delivered'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });

    if (d.status === 'Registered') {
        document.getElementById('step-registered').classList.add('active');
    } else if (d.status === 'In Transit') {
        document.getElementById('step-registered').classList.add('active');
        document.getElementById('step-transit').classList.add('active');
    } else if (d.status === 'Delivered') {
        document.getElementById('step-registered').classList.add('active');
        document.getElementById('step-transit').classList.add('active');
        document.getElementById('step-delivered').classList.add('active');
    }

    resultCard.classList.remove('hidden');
}

function showError(msg) {
    errorMsg.querySelector('span').innerText = msg;
    errorMsg.classList.remove('hidden');
}

function resetBtn() {
    trackBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Track Shipment`;
    trackBtn.disabled  = false;
}
