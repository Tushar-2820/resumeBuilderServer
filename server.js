const express = require("express");
const { buildResume } = require("./resumeService");
const { pdfDownload } = require("./pdfService");
const cors = require('cors');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: ["http://localhost:5173","https://ats-resume-builde.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type'],
    credentials: true, // only if you use cookies/auth
}));

app.use(express.json({ limit: '10mb' })); // increase limit for large HTML
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

app.listen(PORT, () => {
    console.log("Server running on port 3000");
});
