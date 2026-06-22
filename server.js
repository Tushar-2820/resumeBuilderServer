const express = require("express");
const { buildResume } = require("./resumeService");
const { pdfDownload } = require("./pdfService");
const cors = require('cors');

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // only if you use cookies/auth
}));

app.use(express.json());

app.post("/build-resume", async (req, res) => {
    try {
        const result = await buildResume(req.body);
        res.json({ success: true, result: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            result: "Failed to generate resume",
        });
    }
});

app.post("/generatePdf", pdfDownload)

app.listen(3000, () => {
    console.log("Server running on port 3000");
});