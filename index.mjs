import puppeteer from 'puppeteer';
import { FindDatesAfter, swedishMonths } from './functions.mjs';
import { sendMessage, listen } from './botzilla.mjs';

(async () => {
    listen();
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/opt/render/.cache/puppeteer/chrome/linux-132.0.6834.110/chrome-linux64/chrome',  // Render default Chrome path
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
    await page.setViewport({ width: 390, height: 844 });  // iPhone 12 size

    try {
        await page.goto('https://booking.nrm.se/booking/1/1/offers/232', { waitUntil: 'networkidle0' });
        await page.click('#dateFilterButton');

        // Extract raw dates from dropdown
        const rawDates = await page.evaluate(() =>
            Array.from(document.querySelectorAll('a.dropdown-item'))
                .map(el => el.innerText.trim())
                .filter(text => /\d{1,2} \w+ \d{4}/.test(text))
        );

        const formattedDates = rawDates.map(date => {
            let [day, month, year] = date.split(' ');
            return `${year}-${swedishMonths[month.toLowerCase()]}-${day.padStart(2, '0')}`;  // Format to YYYY-MM-DD
        });

        // Log dates
        rawDates.forEach((rawDate, i) => console.log(`${rawDate} --> ${formattedDates[i]}`));

        // Filter by cutoff date
        const res = FindDatesAfter('2025-02-26', formattedDates);

        // Send to Telegram
        if (res.datesAfterCutoff.length > 0) {
            sendMessage(`Interstellar @ Cosmonova – There are ${res.datesAfterCutoff.length} dates after ${res.cutoffDate}:\n${res.datesAfterCutoff.join('\n')}\n https://booking.nrm.se/booking/1/1/offers/232`);
            console.log("Found new dates!");
        } else {
            sendMessage(`Interstellar @ Cosmonova – No dates found after ${res.cutoffDate}.`);
            console.log("Sorry!");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed.');
        }
        process.exit(0);  // Exit the process
    }
})();