// ------------------ FIREBASE INIT ------------------
const firebaseConfig = {
  apiKey: "AIzaSyDJeborWlMvcEUwVjo1tKvP-9rso7pK-6M",
  authDomain: "campselp.firebaseapp.com",
  projectId: "campselp",
  storageBucket: "campselp.firebasestorage.app",
  messagingSenderId: "358438554046",
  appId: "1:358438554046:web:a774aef36e2f24edcc11ef"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ------------------ CREATE REQUEST (STUDENT) ------------------
const requestForm = document.getElementById("requestForm");

if (requestForm) {
  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Not logged in");
      return;
    }

    const title = requestForm.title.value;
    const description = requestForm.description.value;
    const pages = requestForm.pages.value;
    const type = requestForm.type.value;
    const urgency = requestForm.urgency.value;

    const price = pages * (type === "ppt" ? 40 : 25) * (urgency === "fast" ? 1.5 : 1);

    try {
      await db.collection("requests").add({
        uid: user.uid,
        title,
        description,
        pages: Number(pages),
        type,
        urgency,
        price,
        status: "pending",
        createdAt: Date.now()
      });

      alert("Request submitted");

      requestForm.reset();

    } catch (err) {
      alert(err.message);
    }
  });
}

// ------------------ SIGNUP ------------------
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = signupForm.email.value.trim();
    const password = signupForm.password.value.trim();
    const role = signupForm.role.value;

    try {
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCred.user;

      await db.collection("users").doc(user.uid).set({
        email,
        role,
        blocked: false,
        createdAt: Date.now()
      });

      alert("Signup successful");

      if (role === "student") {
        window.location = "student.html";
      } else {
        window.location = "worker.html";
      }

    } catch (err) {
      alert(err.message);
    }
  });
}


// ------------------ LOGIN ------------------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    try {
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      const user = userCred.user;

      const doc = await db.collection("users").doc(user.uid).get();

      if (!doc.exists) {
        alert("User not found");
        return;
      }

      const data = doc.data();

      if (data.blocked) {
        alert("Account blocked");
        return;
      }

      if (data.role === "student") {
        window.location = "student.html";
      } else {
        window.location = "worker.html";
      }

    } catch (err) {
      alert(err.message);
    }
  });
}


// ------------------ PRICE CALCULATION ------------------
const pagesInput = document.getElementById("pagesInput");
const typeSelect = document.getElementById("typeSelect");
const urgencySelect = document.getElementById("urgencySelect");
const pricePreview = document.getElementById("pricePreview");

if (pagesInput && typeSelect && urgencySelect && pricePreview) {

  const BASE_NOTES = 25;
  const BASE_PPT = 40;

  function calc() {
    const pages = parseInt(pagesInput.value) || 0;
    const type = typeSelect.value;
    const urgency = urgencySelect.value;

    let base = type === "ppt" ? BASE_PPT : BASE_NOTES;
    let multiplier = urgency === "fast" ? 1.5 : 1;

    pricePreview.innerText = pages * base * multiplier;
  }

  pagesInput.addEventListener("input", calc);
  typeSelect.addEventListener("change", calc);
  urgencySelect.addEventListener("change", calc);

  calc();
}


// ------------------ WORKER (LOCAL FOR NOW) ------------------
const acceptButtons = document.querySelectorAll(".acceptBtn");
const myJobsContainer = document.getElementById("myJobs");

let myJobs = [];

if (acceptButtons.length > 0 && myJobsContainer) {
  acceptButtons.forEach(btn => {
    btn.addEventListener("click", () => {

      if (myJobs.length >= 5) {
        alert("Max 5 jobs reached");
        return;
      }

      myJobs.push(btn.parentElement.innerHTML);
      btn.parentElement.remove();

      renderJobs();
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


// ------------------ ADMIN (PLACEHOLDER FOR NOW) ------------------
const pendingPaymentsEl = document.getElementById("pendingPayments");
const allRequestsEl = document.getElementById("allRequests");
const usersListEl = document.getElementById("usersList");

if (pendingPaymentsEl && allRequestsEl && usersListEl) {
  pendingPaymentsEl.innerHTML = "<p>Waiting for data...</p>";
  allRequestsEl.innerHTML = "<p>Waiting for data...</p>";
  usersListEl.innerHTML = "<p>Waiting for data...</p>";
}
