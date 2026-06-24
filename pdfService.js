const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');





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
                    <style>${tailwindCSS}</style>
                
             
               
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
                '--disable-gpu',
                '--single-process',
  ],
  headless: 'new',
});

        const page = await browser.newPage();
         await page.setViewport({ width: 1280, height: 800 });

        
     // Block external requests
        await page.setRequestInterception(true);
        page.on('request', (interceptedReq) => {
            interceptedReq.abort();
        });

  // Use data URI instead of setContent to avoid timeout
        const encoded = Buffer.from(wrappedHtml).toString('base64');
        await page.goto(`data:text/html;base64,${encoded}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
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
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = {
    pdfDownload
}
