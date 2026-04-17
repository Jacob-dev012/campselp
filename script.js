
// ------------------ STOP FORM REFRESH ------------------
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
