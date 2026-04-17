
const firebaseConfig = {
  apiKey: "AIzaSyDJeborWlMvcEUwVjo1tKvP-9rso7pK-6M",
  authDomain: "campselp.firebaseapp.com",
  projectId: "campselp",
  storageBucket: "campselp.firebasestorage.app",
  messagingSenderId: "358438554046",
  appId: "1:358438554046:web:a774aef36e2f24edcc11ef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();// ------------------ STOP FORM REFRESH ------------------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Signup coming soon");
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Login coming soon");
  });
}

// ------------------ PRICE CALCULATION (STUDENT) ------------------
const pagesInput = document.getElementById('pagesInput');
const typeSelect = document.getElementById('typeSelect');
const urgencySelect = document.getElementById('urgencySelect');
const pricePreview = document.getElementById('pricePreview');

// ------------------ ADMIN LOGIC ------------------

// helpers
const pendingPaymentsEl = document.getElementById('pendingPayments');
const allRequestsEl = document.getElementById('allRequests');
const usersListEl = document.getElementById('usersList');

// sample local state (will later come from Firebase)
let requests = [];
let users = [];

// render admin dashboard
function renderAdmin() {
  if (!pendingPaymentsEl || !allRequestsEl || !usersListEl) return;

  // Pending Payments (awaiting_payment)
  pendingPaymentsEl.innerHTML = "";

  const pending = requests.filter(r => r.status === "awaiting_payment");

  pending.forEach(r => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${r.title}</strong></p>
      <p>${r.studentEmail || "unknown"}</p>
      <button onclick="approvePayment('${r.id}')">Approve</button>
      <button onclick="rejectPayment('${r.id}')">Reject</button>
    `;
    pendingPaymentsEl.appendChild(div);
  });

  // All Requests
  allRequestsEl.innerHTML = "";

  requests.forEach(r => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${r.title}</strong> - ${r.status}</p>
      <p>${r.type} | ${r.pages} pages</p>
    `;
    allRequestsEl.appendChild(div);
  });

  // Users
  usersListEl.innerHTML = "";

  users.forEach(u => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p>${u.email} (${u.role})</p>
      <button onclick="toggleBlock('${u.id}')">
        ${u.blocked ? "Unblock" : "Block"}
      </button>
    `;
    usersListEl.appendChild(div);
  });
}

// admin actions
window.approvePayment = function(id) {
  const req = requests.find(r => r.id === id);
  if (req) req.status = "approved";
  renderAdmin();
};

window.rejectPayment = function(id) {
  const req = requests.find(r => r.id === id);
  if (req) req.status = "rejected";
  renderAdmin();
};

window.toggleBlock = function(id) {
  const user = users.find(u => u.id === id);
  if (user) user.blocked = !user.blocked;
  renderAdmin();
};

// initial render
renderAdmin();
if (pagesInput && typeSelect && urgencySelect && pricePreview) {

  const BASE_NOTES = 25;
  const BASE_PPT = 40;

  function calculatePrice() {
    const pages = parseInt(pagesInput.value) || 0;
    const type = typeSelect.value;
    const urgency = urgencySelect.value;

    let base = type === "ppt" ? BASE_PPT : BASE_NOTES;
    let multiplier = urgency === "fast" ? 1.5 : 1;

    let total = pages * base * multiplier;

    pricePreview.innerText = total;
  }

  pagesInput.addEventListener('input', calculatePrice);
  typeSelect.addEventListener('change', calculatePrice);
  urgencySelect.addEventListener('change', calculatePrice);

  calculatePrice();
}

// ------------------ WORKER LOGIC ------------------
const acceptButtons = document.querySelectorAll('.acceptBtn');
const myJobsContainer = document.getElementById('myJobs');

let myJobs = [];

if (acceptButtons.length > 0 && myJobsContainer) {

  acceptButtons.forEach((btn) => {
    btn.addEventListener('click', () => {

      if (myJobs.length >= 5) {
        alert("Max 5 jobs reached");
        return;
      }

      const jobCard = btn.parentElement;

      const jobData = jobCard.innerHTML;

      myJobs.push(jobData);

      renderJobs();

      jobCard.remove();
    });
  });

  function renderJobs() {
    myJobsContainer.innerHTML = "";

    myJobs.forEach(job => {
      const div = document.createElement("div");
      div.className = "job";
      div.innerHTML = job;
      myJobsContainer.appendChild(div);
    });
  }
}
