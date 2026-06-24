const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


const tailwindCSS = fs.readFileSync(
    path.join(__dirname, 'tailwind.output.css'),
    'utf8'
);

const pdfDownload = async (req, res) => {
    try {
        const { html } = req.body;

            if (!html) {
            return res.status(400).send("No HTML provided");
        }

         const wrappedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    <meta charset="UTF-8">
                    <style>${tailwindCSS}</style>
                    body { font-family: sans-serif; }
                </style>
                <link rel="stylesheet" href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css">
            </head>
            <body class='bg-white p-5'>
                ${html}
            </body>
            </html>
        `;

       const browser = await puppeteer.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ],
  headless: true,
});

        const page = await browser.newPage();
         await page.setViewport({ width: 1280, height: 800 });

          // Block ALL external requests - no CDN, no fonts, no images
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const url = req.url();
            if (url.startsWith('http://') || url.startsWith('https://')) {
                req.abort();
            } else {
                req.continue();
            }
        });

       await page.setContent(wrappedHtml, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

           await page.evaluateHandle('document.fonts.ready');
        await new Promise(resolve => setTimeout(resolve, 1000));

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
