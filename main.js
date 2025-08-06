 window.addEventListener('scroll', () => {
    const heroSection = document.querySelector('.hero');
    const floating = document.getElementById('floatingEffect');
    const heroPosition = heroSection.getBoundingClientRect().top;

    if (heroPosition < window.innerHeight && heroPosition > -heroSection.offsetHeight) {
      floating.classList.remove('hidden');
    } else {
      floating.classList.add('hidden');
    }
  });
particlesJS('particles-js', {
    "particles": {
      "number": {
        "value": 60,
        "density": { "enable": true, "value_area": 800 }
      },
      "color": { "value": ["#8b0000", "#d97706", "#f97316"] },
      "shape": { "type": "circle" },
      "opacity": {
        "value": 0.5,
        "random": true,
        "anim": { "enable": false }
      },
      "size": {
        "value": 3,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 5,
          "size_min": 0.1,
          "sync": false
        }
      },
      "move": {
        "enable": true,
        "speed": 2,
        "direction": "none",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": { "enable": true, "mode": "repulse" },
        "onclick": { "enable": true, "mode": "push" }
      },
      "modes": {
        "repulse": { "distance": 100, "duration": 0.4 },
        "push": { "particles_nb": 4 }
      }
    },
    "retina_detect": true
  });