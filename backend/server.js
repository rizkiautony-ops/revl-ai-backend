import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

app.set("trust proxy", true);

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
ANTI SPAM
========================================
*/

const requestTracker = {};

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
========================================
*/

app.post("/chat", async (req, res) => {

    try {

        const { message } = req.body;

        /*
        ================================
        VALIDASI
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

        if (cleanMessage.length > 2000) {

            return res.status(400).json({
                success: false,
                reply: "Pesan terlalu panjang."
            });

        }

        /*
        ================================
        ANTI SPAM 3 DETIK
        ================================
        */

        const userIp =
            req.headers["x-forwarded-for"] ||
            req.ip ||
            "unknown";

        const now = Date.now();

        if (
            requestTracker[userIp] &&
            now - requestTracker[userIp] < 3000
        ) {

            return res.status(200).json({
                success: false,
                reply: "Tunggu 3 detik sebelum mengirim pesan lagi."
            });

        }

        requestTracker[userIp] = now;

        /*
        ================================
        PROMPT
        ================================
        */

        const prompt = `
Kamu adalah REVl AI Assistant.

Aturan:
- Jawab natural
- Santai
- Modern
- Jelas
- Tidak terlalu formal
- Tetap akurat
- Gunakan bahasa Indonesia

Pesan user:
${cleanMessage}
`;

        /*
        ================================
        FETCH AI
        ================================
        */

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 30000);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const result = await model.generateContent(prompt);

        const aiText = result.response.text();

        if (!aiText || aiText.trim().length === 0) {

            return res.status(200).json({
                success: false,
                reply: "AI tidak memberikan jawaban."
            });

        }
        /*
        ================================
        SUCCESS
        ================================
        */

        return res.status(200).json({
            success: true,
            reply: aiText
        });

    } catch (error) {

        console.error("SERVER ERROR:", error);

        if (error.name === "AbortError") {

            return res.status(200).json({
                success: false,
                reply: "AI terlalu lama merespon. Coba lagi."
            });

        }

        return res.status(200).json({
            success: false,
            reply: "Server sedang mengalami gangguan."
        });

    }

});

/*
========================================
404
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

    console.log(
        `REVl AI Backend running on port ${PORT}`
    );

});