const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function init() {
  resize();
  createParticles(100);
  animate();
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

window.addEventListener('resize', resize);

function createParticles(count) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 1,
      speedY: (Math.random() - 0.5) * 1,
      color: `rgba(0, 200, 150, ${Math.random() * 0.4 + 0.1})`
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;

    // Wrap around screen edges
    if (p.x > width) p.x = 0;
    else if (p.x < 0) p.x = width;

    if (p.y > height) p.y = 0;
    else if (p.y < 0) p.y = height;

    // Draw circle
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

init();

// Sample data for alerts (could be replaced with real API calls)
  const sampleAlerts = [
    { time: '2025-08-10 15:30', message: 'Malaria outbreak reported in Tabata area.' },
    { time: '2025-08-10 14:10', message: 'Cholera alert issued for Kigamboni district.' },
    { time: '2025-08-10 13:45', message: 'COVID-19 vaccination campaign extended to Kinondoni.' },
  ];

  // Function to display alerts
  function displayAlerts() {
    const alertsList = document.getElementById('alerts-list');
    alertsList.innerHTML = '';
    sampleAlerts.forEach(alert => {
      const alertDiv = document.createElement('div');
      alertDiv.classList.add('alert', 'alert-danger', 'mb-2');
      alertDiv.innerHTML = `<strong>${alert.time}</strong>: ${alert.message}`;
      alertsList.appendChild(alertDiv);
    });
  }

  // Call display on page load
  displayAlerts();

  // Handle subscription form submission
  function subscribeAlert(event) {
    event.preventDefault();
    const emailInput = document.getElementById('email');
    const msg = document.getElementById('subscribe-message');

    // Here you would add real subscription logic (e.g., API call)
    // For demo: just show thank you message and clear input
    msg.style.display = 'block';
    emailInput.value = '';

    setTimeout(() => {
      msg.style.display = 'none';
    }, 4000);
  }

//pop-up for a specifc day like it filter alert for may be monday only, tuesday and so on
const alertQueue = [];
let isShowingAlert = false;

function showNextAlert() {
  if (alertQueue.length === 0) {
    isShowingAlert = false;
    return;
  }
  isShowingAlert = true;

  const popup = document.getElementById('popup-alert');
  const alert = alertQueue.shift();
  popup.textContent = alert;
  popup.classList.add('show');

  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => {
      showNextAlert();
    }, 300);
  }, 4000);
}

function enqueueAlert(message) {
  alertQueue.push(message);
  if (!isShowingAlert) {
    showNextAlert();
  }
}

const alerts = [
  { day: 'Sunday', message: 'Malaria outbreak reported in Tabata!' },
  { day: 'Sunday', message: 'Cholera alert issued for Kigamboni!' },
  { day: 'Monday', message: 'COVID-19 vaccination extended to Kinondoni.' },
];

function getTodayName() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

function enqueueTodaysAlerts() {
  const today = getTodayName();
  alerts.forEach(alert => {
    if (alert.day === today) {
      enqueueAlert(alert.message);
    }
  });
}
// Call this on page load or when you want to show today's alerts
enqueueTodaysAlerts();

//Footer Effect!
document.getElementById('currentYear').textContent = new Date().getFullYear();


