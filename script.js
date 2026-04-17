// ================= FIREBASE INIT =================
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


// ================= SIGNUP =================
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

      if (role === "student") {
        window.location.href = "student.html";
      } else {
        window.location.href = "worker.html";
      }

    } catch (err) {
      alert(err.message);
    }
  });
}


// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    try {
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      const user = userCred.user;

      const docSnap = await db.collection("users").doc(user.uid).get();

      if (!docSnap.exists) {
        alert("User profile missing");
        return;
      }

      const data = docSnap.data();

      if (data.blocked === true) {
        alert("Account blocked");
        await auth.signOut();
        return;
      }

      if (data.role === "student") {
        window.location.href = "student.html";
      } else if (data.role === "worker") {
        window.location.href = "worker.html";
      } else {
        alert("Invalid role");
      }

    } catch (err) {
      alert(err.message);
    }
  });
}


// ================= STUDENT REQUEST SYSTEM =================
const requestForm = document.getElementById("requestForm");

if (requestForm) {
  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("Not logged in");

    const title = requestForm.title.value;
    const description = requestForm.description.value;
    const pages = Number(requestForm.pages.value);
    const type = requestForm.type.value;
    const urgency = requestForm.urgency.value;

    const price = pages * (type === "ppt" ? 40 : 25) * (urgency === "fast" ? 1.5 : 1);

    await db.collection("requests").add({
      uid: user.uid,
      title,
      description,
      pages,
      type,
      urgency,
      price,
      status: "pending",
      workerId: null,
      createdAt: Date.now()
    });

    alert("Request submitted");
    requestForm.reset();
  });
}


// ================= PRICE PREVIEW =================
const pagesInput = document.getElementById("pagesInput");
const typeSelect = document.getElementById("typeSelect");
const urgencySelect = document.getElementById("urgencySelect");
const pricePreview = document.getElementById("pricePreview");

if (pagesInput && typeSelect && urgencySelect && pricePreview) {

  function calc() {
    const pages = Number(pagesInput.value) || 0;
    const type = typeSelect.value;
    const urgency = urgencySelect.value;

    const base = type === "ppt" ? 40 : 25;
    const multiplier = urgency === "fast" ? 1.5 : 1;

    pricePreview.innerText = pages * base * multiplier;
  }

  pagesInput.addEventListener("input", calc);
  typeSelect.addEventListener("change", calc);
  urgencySelect.addEventListener("change", calc);

  calc();
}


// ================= WORKER SYSTEM =================
const availableRequests = document.getElementById("availableRequests");

let workerJobs = [];

if (availableRequests) {
  db.collection("requests")
    .where("status", "==", "pending")
    .onSnapshot((snap) => {

      availableRequests.innerHTML = "";

      snap.forEach(doc => {
        const r = doc.data();

        const div = document.createElement("div");
        div.innerHTML = `
          <p><strong>${r.title}</strong></p>
          <p>${r.pages} pages | ${r.type}</p>
          <p>GH₵ ${r.price}</p>
          <button class="acceptBtn">Accept</button>
        `;

        div.querySelector(".acceptBtn").addEventListener("click", async () => {

          if (workerJobs.length >= 5) {
            alert("Max 5 jobs reached");
            return;
          }

          if (!auth.currentUser) {
            alert("Not logged in");
            return;
          }

          await db.collection("requests").doc(doc.id).update({
            status: "assigned",
            workerId: auth.currentUser.uid
          });

          workerJobs.push(doc.id);
        });

        availableRequests.appendChild(div);
      });
    });
}


// ================= ADMIN SYSTEM =================
const pendingPayments = document.getElementById("pendingPayments");
const allRequests = document.getElementById("allRequests");
const usersList = document.getElementById("usersList");

if (pendingPayments || allRequests || usersList) {

  db.collection("requests").onSnapshot((snap) => {

    let requests = [];

    snap.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    if (pendingPayments) {
      pendingPayments.innerHTML = "";

      requests.filter(r => r.status === "pending").forEach(r => {
        const div = document.createElement("div");
        div.innerHTML = `
          <p>${r.title}</p>
          <p>GH₵ ${r.price}</p>
          <button onclick="approveRequest('${r.id}')">Approve</button>
        `;
        pendingPayments.appendChild(div);
      });
    }

    if (allRequests) {
      allRequests.innerHTML = "";

      requests.forEach(r => {
        allRequests.innerHTML += `
          <div>
            <p>${r.title} - ${r.status}</p>
          </div>
        `;
      });
    }
  });

  db.collection("users").onSnapshot((snap) => {

    if (!usersList) return;

    usersList.innerHTML = "";

    snap.forEach(doc => {
      const u = doc.data();

      const div = document.createElement("div");
      div.innerHTML = `
        <p>${u.email} (${u.role})</p>
        <button onclick="toggleBlock('${doc.id}', ${u.blocked})">
          ${u.blocked ? "Unblock" : "Block"}
        </button>
      `;

      usersList.appendChild(div);
    });
  });
}


// ================= ADMIN ACTIONS =================
window.approveRequest = async function(id) {
  await db.collection("requests").doc(id).update({
    status: "approved"
  });
};

window.toggleBlock = async function(id, blocked) {
  await db.collection("users").doc(id).update({
    blocked: !blocked
  });
};
