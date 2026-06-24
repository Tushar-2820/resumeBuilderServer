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
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: #fff; line-height: 1.6; }
 
        #resumeToDownload {
            max-width: 896px;
            margin: 0 auto;
            background: #fff;
            padding: 24px;
            font-family: Arial, sans-serif;
            color: #111;
        }
 
        .pb-4 { padding-bottom: 16px; }
        .text-center { text-align: center; border-bottom: 2px solid #111; margin-bottom: 16px; }
        .text-3xl { font-size: 26px; }
        .font-bold { font-weight: 700; }
        .mt-2 { margin-top: 8px; }
        .text-sm { font-size: 12px; color: #000; }
        .mt-6 { margin-top: 18px; }
 
        h2 {
            font-size: 12px;
            font-weight: 700;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            margin-bottom: 8px;
        }
 
        .uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
        .whitespace-pre-line { white-space: pre-line; font-size: 12.5px; line-height: 1.7; }
        .mt-4 { margin-top: 12px; }
        .font-semibold { font-size: 13px; font-weight: 700; color: #000; }
        .text-gray-600 { color: #444; }
        .list-disc { list-style-type: disc; }
        .pl-5 { padding-left: 20px; }
 
        ul li { font-size: 12.5px; color: #111; margin-bottom: 3px; line-height: 1.6; }
        p { font-size: 12.5px; color: #111; line-height: 1.6; margin-bottom: 3px; }
        strong { font-weight: 700; color: #000; }
        h3 { font-size: 13px; font-weight: 700; color: #000; margin-bottom: 2px; }
        a { color: #000; text-decoration: none; }
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
