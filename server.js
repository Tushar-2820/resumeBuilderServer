const express = require("express");
const { buildResume } = require("./resumeService");
const { pdfDownload } = require("./pdfService");
const cors = require('cors');
const PORT = process.env.PORT || 3000;

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
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to generate resume",
        });
    }
});

app.post("/generatePdf", pdfDownload)

app.listen(PORT, () => {
    console.log("Server running on port 3000");
});
