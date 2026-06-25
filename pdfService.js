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
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Calibri, Arial, sans-serif;
    font-size: 11pt;
    color: #222;
    background: #fff;
    line-height: 1.5;
}

#resumeToDownload {
    max-width: 850px;
    margin: 0 auto;
    padding: 30px;
    background: #fff;
}

/* Header */
.text-center {
    text-align: center;
    border-bottom: 2px solid #2d3748;
    padding-bottom: 12px;
    margin-bottom: 18px;
}

.text-3xl {
    font-size: 28px;
    font-weight: 700;
    color: #111;
    letter-spacing: 0.5px;
}

.text-sm {
    font-size: 11px;
    color: #444;
    margin-top: 6px;
    line-height: 1.4;
}

.text-sm a {
    color: #222;
    text-decoration: none;
}

/* Sections */
.mt-6 {
    margin-top: 20px;
}

h2 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #111;
    border-bottom: 1.5px solid #2d3748;
    padding-bottom: 4px;
    margin-bottom: 10px;
}

h3 {
    font-size: 12px;
    font-weight: 700;
    color: #111;
    margin-bottom: 2px;
}

.font-semibold {
    font-weight: 700;
}

.text-gray-600 {
    color: #555;
    font-size: 11px;
}

/* Paragraphs */
p {
    font-size: 11px;
    color: #222;
    line-height: 1.6;
    margin-bottom: 4px;
}

.whitespace-pre-line {
    white-space: pre-line;
    font-size: 11px;
    line-height: 1.6;
}

/* Lists */
ul {
    margin-top: 4px;
}

ul li {
    font-size: 11px;
    color: #222;
    line-height: 1.5;
    margin-bottom: 4px;
}

.list-disc {
    list-style-type: disc;
}

.pl-5 {
    padding-left: 18px;
}

/* Utility */
.pb-4 {
    padding-bottom: 16px;
}

.mt-2 {
    margin-top: 8px;
}

.mt-4 {
    margin-top: 12px;
}

.uppercase {
    text-transform: uppercase;
}

strong {
    font-weight: 700;
    color: #111;
}

/* Print Optimization */
@media print {
    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    #resumeToDownload {
        padding: 20px;
    }

    a {
        color: #111;
        text-decoration: none;
    }
}
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
