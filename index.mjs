import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
        ],
    });

    const page = await browser.newPage();
    await page.goto('https://google.com');
    console.log('Page loaded successfully');

    await browser.close();
})();