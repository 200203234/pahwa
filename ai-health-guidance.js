function sendMessage() {
  const chatBox = document.getElementById('chatBox');
  const question = document.getElementById('userQuestion').value.trim();

  if (!question) {
    alert('Please type your question.');
    return;
  }

  // Add user's message
  chatBox.innerHTML += `<div class="mb-2"><strong>You:</strong> ${question}</div>`;
  document.getElementById('userQuestion').value = '';

  // Simulated AI thinking
  const aiMessage = document.createElement('div');
  aiMessage.classList.add('mb-2');
  aiMessage.innerHTML = `<strong>AI:</strong> <span id="typing"></span>`;
  chatBox.appendChild(aiMessage);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Simulated AI typing effect
  const fullResponse = "According to official protocols, please monitor your symptoms, rest, and seek medical attention if your condition worsens.";
  let i = 0;
  const typingElement = aiMessage.querySelector('#typing');

  const typingInterval = setInterval(() => {
    typingElement.textContent += fullResponse.charAt(i);
    i++;
    chatBox.scrollTop = chatBox.scrollHeight;
    if (i >= fullResponse.length) clearInterval(typingInterval);
  }, 30);
}
 //Footer Effect!
    document.getElementById('currentYear').textContent = new Date().getFullYear();