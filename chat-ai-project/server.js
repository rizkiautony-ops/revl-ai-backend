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

app.use(express.json({
    limit: "1mb"
}));

/*
========================================
ROOT ROUTE
========================================
*/

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "REVl AI Backend Running"
    });

});

/*
========================================
CHAT API
POST /chat
========================================
*/

app.post("/chat", async (req, res) => {

    try {

        const { message } = req.body;

        /*
        ================================
        VALIDATION
        ================================
        */

        if (!message || typeof message !== "string") {

            return res.status(400).json({
                success: false,
                reply: "Pesan tidak valid."
            });

        }

        const cleanMessage = message.trim();

        if (cleanMessage.length === 0) {

            return res.status(400).json({
                success: false,
                reply: "Pesan kosong."
            });

        }

        /*
        ================================
        AI PROMPT
        ================================
        */

        const prompt = `
Kamu adalah REVl AI Assistant.

Aturan:
- Jawab natural
- Santai
- Modern
- Singkat tapi jelas
- Jangan terlalu formal
- Tetap membantu dan akurat

Pesan user:
${cleanMessage}
`;

        /*
        ================================
        FETCH AI RESPONSE
        ================================
        */

        const aiResponse = await fetch(
            `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
            {
                method: "GET"
            }
        );

        /*
        ================================
        HANDLE FAILED RESPONSE
        ================================
        */

        if (!aiResponse.ok) {

            console.error("AI RESPONSE ERROR:", aiResponse.status);

            return res.status(500).json({
                success: false,
                reply: "AI gagal merespon."
            });

        }

        /*
        ================================
        GET AI TEXT
        ================================
        */

        const aiText = await aiResponse.text();

        /*
        ================================
        FINAL RESPONSE
        ================================
        */

        return res.status(200).json({
            success: true,
            reply: aiText
        });

    } catch (error) {

        console.error("SERVER ERROR:", error);

        return res.status(500).json({
            success: false,
            reply: "Terjadi error pada server."
        });

    }

});

/*
========================================
404 ROUTE
========================================
*/

app.use((req, res) => {

    res.status(404).json({
        success: false,
        error: "Route tidak ditemukan."
    });

});

/*
========================================
START SERVER
========================================
*/

app.listen(PORT, () => {

    console.log(`REVl AI Backend running on port ${PORT}`);

});