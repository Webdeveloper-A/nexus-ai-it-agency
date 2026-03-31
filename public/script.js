// Tailwind script
tailwind.config = { content: ["./**/*.html"] };

// Mobile menu
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Smooth Scroll uchun barcha linklarni yaxshilash
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    if (this.getAttribute('href') !== '#') {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Scroll Animatsiyalari
function handleScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.85) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', handleScrollAnimations);
window.addEventListener('load', () => {
  handleScrollAnimations(); // Dastlabki yuklashda ham tekshirish
});

// ==================== Floating Chat ====================
const floatingChat = document.getElementById('floating-chat');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

let messages = [];

function toggleChat() {
  floatingChat.classList.toggle('hidden');
  if (!floatingChat.classList.contains('hidden')) {
    setTimeout(() => chatInput.focus(), 300);
  }
}

function addMessage(role, content) {
  const div = document.createElement('div');
  div.className = role === 'user' ? 'flex justify-end' : 'flex justify-start';
  
  div.innerHTML = `
    <div class="${role === 'user' 
      ? 'bg-cyan-400 text-slate-950' 
      : 'glass'} max-w-[85%] rounded-3xl px-6 py-4">
      ${content}
    </div>
  `;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage('user', text);
  messages.push({ role: "user", content: text });
  chatInput.value = '';

  const loading = document.createElement('div');
  loading.className = 'flex justify-start';
  loading.innerHTML = `
    <div class="glass px-6 py-4 rounded-3xl flex items-center gap-2">
      <div class="flex gap-1">
        <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
      AI yozmoqda...
    </div>
  `;
  chatWindow.appendChild(loading);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const res = await fetch('https://nexus-ai-it-agency.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    const data = await res.json();
    loading.remove();

    if (data.reply) {
      addMessage('assistant', data.reply);
      messages.push({ role: "assistant", content: data.reply });
    }
  } catch (e) {
    loading.remove();
    addMessage('assistant', 'Xatolik yuz berdi. Qayta urinib ko‘ring.');
  }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

// ==================== Booking Form ====================
const bookingForm = document.getElementById('booking-form');
const successMsg = document.getElementById('success-message');

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    service: document.getElementById('service').value,
    date: document.getElementById('date').value
  };

  try {
    const res = await fetch('https://nexus-ai-it-agency.onrender.com/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
      successMsg.textContent = result.message;
      successMsg.classList.remove('hidden');
      bookingForm.reset();
      setTimeout(() => successMsg.classList.add('hidden'), 8000);
    } else {
      alert(result.error || "Xatolik yuz berdi");
    }
  } catch (err) {
    alert("Server bilan bog‘lanishda muammo yuz berdi.");
  }
});
