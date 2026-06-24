const puppeteer = require('puppeteer');






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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #000; background: #fff; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 48px; }

        /* Header */
        .header { text-align: center; padding-bottom: 16px; border-bottom: 2px solid #000; margin-bottom: 20px; }
        .header h1 { font-size: 26px; font-weight: 700; color: #000; }
        .header p { font-size: 12px; color: #000; margin-top: 6px; }
        .header a { color: #000; text-decoration: none; }

        /* Section */
        section { margin-bottom: 18px; }
        h2 { font-size: 13px; font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 10px; }

        /* Experience / Projects */
        .entry { margin-bottom: 14px; }
        .entry-top { margin-bottom: 2px; }
        .entry-title { font-size: 13px; font-weight: 700; color: #000; }
        .entry-sub { font-size: 12.5px; color: #000; }
        .entry-date { font-size: 12px; color: #000; }

        ul { padding-left: 20px; margin-top: 5px; }
        ul li { font-size: 12.5px; color: #000; margin-bottom: 3px; line-height: 1.6; }

        /* Skills */
        .skill-row { font-size: 12.5px; margin-bottom: 5px; }

        /* Education */
        .edu-title { font-size: 13px; font-weight: 700; }
        .edu-sub { font-size: 12.5px; }

        /* Achievements */
        .achievement-list { padding-left: 20px; }
        .achievement-list li { font-size: 12.5px; margin-bottom: 3px; line-height: 1.6; }
    </style>

                
             
               
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
