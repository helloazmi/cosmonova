const puppeteer = require('puppeteer');
require('dotenv').config();
const { FindDatesAfter, swedishMonths } = require('./functions');
const { sendMessage } = require('./botzilla');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });

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
            return `${year}-${swedishMonths[month.toLowerCase()]}-${day.padStart(2, '0')}`;  // YYYY-MM-DD format
        });

        // Output raw and formatted dates
        console.log('📅 Found dates in the dropdown:');
        rawDates.forEach((rawDate, i) => console.log(`${rawDate} --> ${formattedDates[i]}`));

        console.log('Formatted Dates Array:', formattedDates);


        // Call the function to check for dates after a specific date
        const res = FindDatesAfter('2025-02-26', formattedDates);
        //console.log(res.msg);

        sendMessage(`There are ${res.datesAfterCutoff.length} dates after ${res.cutoffDate}:\n${res.datesAfterCutoff.join('\n')}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed.');
        }
        process.exit(0);  // Forcefully exit the process
    }
})();


