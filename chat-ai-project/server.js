import express from "express";
import cors from "cors";

const app = express();

/*
========================================
CONFIG
========================================
*/

const PORT = process.env.PORT || 3000;

/*
========================================
MIDDLEWARE
========================================
*/

app.use(cors());
app.use(express.json());

/*
========================================
ROOT
========================================
*/

app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "REVl AI Backend Running"
    });
});

/*
========================================
CHAT API  —  endpoint: POST /chat
========================================
*/

app.post("/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;

        /*  VALIDATION  */
        if (!userMessage || userMessage.trim() === "") {
            return res.status(400).json({ reply: "Pesan kosong." });
        }

        /*  AI PROMPT  */
        const prompt = `Kamu adalah REVl AI Assistant.

Gaya bicara:
- santai, modern, natural
- singkat tapi jelas
- seperti manusia normal yang cerdas

Jawab pertanyaan user dengan baik dan akurat.

Pertanyaan user:
${userMessage}`;

        /*  FETCH AI (Pollinations — no API key needed)  */
        const response = await fetch(
            `https://text.pollinations.ai/${encodeURIComponent(prompt)}`
        );

        if (!response.ok) {
            return res.status(500).json({ reply: "AI gagal merespon. Coba lagi." });
        }

        const aiReply = await response.text();

        res.json({ reply: aiReply });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ reply: "AI server error. Coba beberapa saat lagi." });
    }

});

/*
========================================
404
========================================
*/

app.use((req, res) => {
    res.status(404).json({ error: "Route tidak ditemukan." });
});

/*
========================================
START SERVER
========================================
*/

app.listen(PORT, () => {
    console.log(`REVl AI Backend running on port ${PORT}`);
});