import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { FindDatesAfter, swedishMonths } from './functions.mjs';
import { sendMessage, listen } from './botzilla.mjs';
import fs from 'fs';

// Log Puppeteer's cache and executable path for debugging
console.log('Puppeteer default cache directory:', puppeteer.defaultArgs().join('\n'));
console.log('Expected Chrome executable path:', puppeteer.executablePath());

dotenv.config();

(async () => {
    listen();  // Start listening for incoming Telegram messages

    const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();

    // Log the path being used
    console.log('🚀 Launching Puppeteer with executable path:', chromePath);

    // Check if the file exists at the path
    if (!fs.existsSync(chromePath)) {
        console.error('❌ Chrome binary not found at:', chromePath);
        process.exit(1);  // Stop execution if the binary is missing
    }

    // Launch Puppeteer with the specified Chrome executable
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: chromePath,  // Use environment or default path
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });  // iPhone 12 size

    try {
        console.log('🌐 Navigating to booking page...');
        await page.goto('https://booking.nrm.se/booking/1/1/offers/232', { waitUntil: 'networkidle0' });

        console.log('📅 Clicking date filter button...');
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

        // Log raw and formatted dates
        console.log('📅 Found dates in the dropdown:');
        rawDates.forEach((rawDate, i) => console.log(`${rawDate} --> ${formattedDates[i]}`));

        // Check dates after the cutoff date
        const res = FindDatesAfter('2025-02-26', formattedDates);

        // Send results to Telegram
        if (res.datesAfterCutoff.length > 0) {
            const message = `Interstellar @ Cosmonova – There are ${res.datesAfterCutoff.length} dates after ${res.cutoffDate}:\n${res.datesAfterCutoff.join('\n')}\n https://booking.nrm.se/booking/1/1/offers/232`;
            sendMessage(message);
            console.log('✅ Found new dates!');
        } else {
            sendMessage(`Interstellar @ Cosmonova – No dates found after ${res.cutoffDate}.`);
            console.log('❌ No new dates found.');
        }

    } catch (error) {
        console.error('🚨 Error occurred:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🛑 Browser closed.');
        }
        process.exit(0);  // Exit the process
    }
})();