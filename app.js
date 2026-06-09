// 1. Import Firebase SDK modules via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvdFAKO1hcC70kTd3BbiuskVJH9XTDtWs",
    authDomain: "trinity-logistics-b076c.firebaseapp.com",
    projectId: "trinity-logistics-b076c",
    storageBucket: "trinity-logistics-b076c.firebasestorage.app",
    messagingSenderId: "700729435351",
    appId: "1:700729435351:web:5cc00ea239cd87259efc92",
    measurementId: "G-20DY9C2Q1N"
};

// 3. Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. DOM Element Selectors
const trackBtn = document.getElementById('track-btn');
const trackingInput = document.getElementById('tracking-id-input');
const resultCard = document.getElementById('tracking-result');
const errorMsg = document.getElementById('error-message');

// 5. Event Listeners
trackBtn.addEventListener('click', performTracking);
trackingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performTracking();
});

// 6. Main Tracking Logic
async function performTracking() {
   const trackingId = trackingInput.value.trim();

    // Reset UI states before loading
    resultCard.classList.add('hidden');
    errorMsg.classList.add('hidden');
    trackBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Searching...`;
    trackBtn.disabled = true;

    if (!trackingId) {
        resetButtonState();
        return;
    }

    try {
        // Point to the specific document inside the 'luggage' collection using trackingId as Document ID
        const docRef = doc(db, "luggage", trackingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const luggageData = docSnap.data();
            renderTrackingDetails(trackingId, luggageData);
        } else {
            // Document ID doesn't exist in Firestore
            showError("Tracking ID not found. Verify and try again.");
        }
    } catch (error) {
        console.error("Firebase Fetch Error:", error);
        showError("Network connection error. Try again later.");
    } finally {
        resetButtonState();
    }
}

// 7. Render Data to the UI
function renderTrackingDetails(id, data) {
    document.getElementById('res-id').innerText = id;
    document.getElementById('res-description').innerText = `${data.description || 'N/A'} (${data.weight || '0kg'})`;
    document.getElementById('res-status-badge').innerText = data.status || 'Registered';
    document.getElementById('res-courier-name').innerText = data.courierName || 'Unassigned';
    document.getElementById('res-courier-phone').innerHTML = `<i class="fa-solid fa-phone"></i> ${data.courierPhone || 'N/A'}`;

    // Reset timeline progress classes
    const steps = ['step-registered', 'step-transit', 'step-delivered'];
    steps.forEach(stepId => document.getElementById(stepId).classList.remove('active'));

    const badge = document.getElementById('res-status-badge');
    const currentStatus = data.status;

    // Evaluate database status and style accordingly
    if (currentStatus === "Registered") {
        document.getElementById('step-registered').classList.add('active');
        updateBadgeStyle(badge, "#ef4444", "rgba(239,68,68,0.1)", "rgba(239,68,68,0.2)");
    } 
    else if (currentStatus === "In Transit") {
        document.getElementById('step-registered').classList.add('active');
        document.getElementById('step-transit').classList.add('active');
        updateBadgeStyle(badge, "#3b82f6", "rgba(59,130,246,0.1)", "rgba(59,130,246,0.2)");
    } 
    else if (currentStatus === "Delivered") {
        document.getElementById('step-registered').classList.add('active');
        document.getElementById('step-transit').classList.add('active');
        document.getElementById('step-delivered').classList.add('active');
        updateBadgeStyle(badge, "#10b981", "rgba(16,185,129,0.1)", "rgba(16,185,129,0.2)");
    }

    resultCard.classList.remove('hidden');
}

// Helper Functions
function updateBadgeStyle(element, color, bg, border) {
    element.style.color = color;
    element.style.backgroundColor = bg;
    element.style.borderColor = border;
}

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove('hidden');
}

function resetButtonState() {
    trackBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Track`;
    trackBtn.disabled = false;
}
