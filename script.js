// ------------------ STOP FORM REFRESH ------------------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Signup clicked (backend coming next)");
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Login clicked (backend coming next)");
  });
}

// ------------------ PRICE CALCULATION ------------------
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

    let basePrice = type === 'ppt' ? BASE_PPT : BASE_NOTES;

    let multiplier = 1;
    if (urgency === 'fast') multiplier = 1.5;

    const total = pages * basePrice * multiplier;

    pricePreview.innerText = total;
  }

  pagesInput.addEventListener('input', calculatePrice);
  typeSelect.addEventListener('change', calculatePrice);
  urgencySelect.addEventListener('change', calculatePrice);

  calculatePrice();
}
