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

const symptoms = [
      "Fever",
      "Cough",
      "Shortness of breath",
      "Sore throat",
      "Fatigue",
      "Headache",
      "Nausea or vomiting",
      "Diarrhea",
      "Muscle or joint pain",
      "Rash",
      "Loss of taste or smell",
      "Chills",
      "Sweating",
      "Abdominal pain",
      "Dizziness"
    ];

    let currentSymptomIndex = 0;
    let hasSymptoms = false;

    function startSymptomCheck() {
      const name = document.getElementById("name").value.trim();
      const location = document.getElementById("location").value.trim();
      const gender = document.getElementById("gender").value;

      if (!name || !location || !gender) {
        alert("Please fill out all fields.");
        return;
      }

      document.getElementById("user-info").style.display = "none";
      document.getElementById("symptom-check").style.display = "block";
      showSymptom();
    }
    function showSymptom() {
    document.getElementById("symptom-question").innerHTML = 
    `Step 2: Please carefully review the following symptoms and indicate "Yes" or "No" for each, based on your current condition.<br><br><b>Do you have ${symptoms[currentSymptomIndex]}?</b>`;

    let progress = (currentSymptomIndex / symptoms.length) * 100;
    document.getElementById("progress-bar").style.width = progress + "%";
    }


    function recordAnswer(answer) {
      if (answer) hasSymptoms = true;

      currentSymptomIndex++;
      if (currentSymptomIndex < symptoms.length) {
        showSymptom();
      } else {
        document.getElementById("symptom-check").style.display = "none";
        if (!hasSymptoms) {
          document.getElementById("other-symptoms-section").style.display = "block";
        } else {
          submitReport();
        }
      }
    }

    function submitReport() {
      document.getElementById("other-symptoms-section").style.display = "none";
      document.getElementById("thank-you").style.display = "block";
    }
    //Footer Effect!
    document.getElementById('currentYear').textContent = new Date().getFullYear();