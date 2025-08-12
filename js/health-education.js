//Safe fallback JS: only defines sendMessage if not already defined
if (typeof sendMessage !== 'function') {
  function sendMessage() {
    const qEl = document.getElementById('userQuestion');
    const chat = document.getElementById('chatBox');
    const text = qEl.value.trim();
    if (!text) return;

    // create user bubble
    const userDiv = document.createElement('div');
    userDiv.className = 'user small';
    userDiv.textContent = text;
    chat.appendChild(userDiv);

    // clear input and scroll
    qEl.value = '';
    chat.scrollTop = chat.scrollHeight;

    // placeholder bot response (simulate AI reply)
    setTimeout(() => {
      const botDiv = document.createElement('div');
      botDiv.className = 'bot small';
      botDiv.textContent = 'Thanks — here is a short tip: wash hands regularly and seek local health support if symptoms worsen.';
      chat.appendChild(botDiv);
      chat.scrollTop = chat.scrollHeight;
    }, 700);
  }
}
// Append a message to chat box
function appendMessage(text, who = 'bot') {
  const chat = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = `message ${who}`; // 'message bot' or 'message user'
  div.textContent = text;
  chat.appendChild(div);
  chat.classList.add('scroll-bottom');
  chat.scrollTop = chat.scrollHeight;
}

/* Example usage:
appendMessage('👋 Welcome! Ask me anything about prevention, care, or emergency support.', 'bot');
appendMessage('How can I get vaccinated in my area?', 'user');
*/
 //Footer Effect!
  document.getElementById('currentYear').textContent = new Date().getFullYear();
