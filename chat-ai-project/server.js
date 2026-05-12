import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

/*
========================================
TEST
========================================
*/

app.get("/", (req, res) => {

    res.send("REVl AI Backend Running");

});

/*
========================================
CHAT
========================================
*/

app.post("/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;

        if (!userMessage) {

            return res.status(400).json({
                reply: "Pesan kosong."
            });

        }

        /*
        ========================================
        FETCH AI
        ========================================
        */

        const response = await fetch(

            `https://text.pollinations.ai/${encodeURIComponent(`
            
            Kamu adalah REVl AI Assistant.

            Jawab dengan:
            - santai
            - natural
            - modern
            - jelas
            - seperti manusia normal

            Pertanyaan user:
            ${userMessage}
            
            `)}`

        );

        const aiReply = await response.text();

        res.json({

            reply: aiReply

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({

            reply: "AI server error."

        });

    }

});

/*
========================================
START SERVER
========================================
*/

app.listen(3000, () => {

    console.log("AI server running on http://localhost:3000");

});