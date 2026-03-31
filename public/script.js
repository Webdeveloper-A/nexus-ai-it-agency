const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// JSON fayl orqali bookinglarni saqlash
const bookingsFile = path.join(__dirname, 'bookings.json');

// Agar fayl yo'q bo'lsa, yaratamiz
if (!fs.existsSync(bookingsFile)) {
  fs.writeFileSync(bookingsFile, JSON.stringify([], null, 2));
}

// ====================== AI Chat API ======================
app.post('/api/chat', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ reply: "AI maslahatchi vaqtincha mavjud emas. OPENAI_API_KEY o'rnatilmagan." });
    }

    const { messages } = req.body;

    const systemPrompt = {
      role: "system",
      content: `Siz Nexus AI IT agentligining virtual maslahatchisisiz. 
      Foydalanuvchiga o'zbek tilida, do'stona va professional javob bering. 
      Xizmatlar: Veb-sayt yaratish, Mobil ilovalar, AI integratsiyasi, Bulut xizmatlari, Kibertahdid himoyasi.`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI javobida xatolik yuz berdi. Keyinroq urinib ko'ring." });
  }
});

// ====================== Booking API ======================
app.post('/api/booking', (req, res) => {
  try {
    const { name, email, service, date } = req.body;

    if (!name || !email || !service || !date) {
      return res.status(400).json({ error: "Barcha maydonlarni to'ldiring!" });
    }

    // Mavjud bookinglarni o'qish
    let bookings = [];
    if (fs.existsSync(bookingsFile)) {
      bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
    }

    // Yangi booking qo'shish
    const newBooking = {
      id: Date.now(),
      name,
      email,
      service,
      date,
      timestamp: new Date().toISOString()
    };

    bookings.push(newBooking);

    // Faylga saqlash
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));

    res.json({ 
      success: true, 
      message: "✅ Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanamiz." 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Serverda xatolik yuz berdi." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ishga tushdi → http://localhost:${PORT}`);
  console.log(`AI Chat va Booking tayyor!`);
});
