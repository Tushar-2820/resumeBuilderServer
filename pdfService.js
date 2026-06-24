const puppeteer = require('puppeteer');


const pdfDownload = async (req, res) => {
    try {
        const { html } = req.body;

       const browser = await puppeteer.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ],
  headless: true,
});

        const page = await browser.newPage();

       await page.setContent(htmlContent, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                bottom: "20px",
                left: "20px",
                right: "20px",
            },
        });

        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="resume.pdf"'
        );



        return res.send(pdf);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to generate PDF");
    }
}

module.exports = {
    pdfDownload
}
