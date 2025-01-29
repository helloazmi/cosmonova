const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set window size
    await page.setViewport({ width: 390, height: 844 });

    try {
        // Navigate to page and open dropdown
        await page.goto('https://booking.nrm.se/booking/1/1/offers/232', { waitUntil: 'networkidle0' });
        await page.click('#dateFilterButton');

        // Extract raw dates from dropdown
        const rawDates = await page.evaluate(() =>
            Array.from(document.querySelectorAll('a.dropdown-item'))
                .map(el => el.innerText.trim())
                .filter(text => /\d{1,2} \w+ \d{4}/.test(text))
        );

        // Convert raw dates to YYYY-MM-DD format
        const swedishMonths = {
            "januari": "01", "februari": "02", "mars": "03", "april": "04", "maj": "05",
            "juni": "06", "juli": "07", "augusti": "08", "september": "09", "oktober": "10",
            "november": "11", "december": "12"
        };

        const formattedDates = rawDates.map(date => {
            let [day, month, year] = date.split(' ');
            return `${year}-${swedishMonths[month.toLowerCase()]}-${day.padStart(2, '0')}`;  // YYYY-MM-DD format
        });

        // Output raw and formatted dates
        console.log('📅 Found dates in the dropdown:');
        rawDates.forEach((rawDate, i) => console.log(`${rawDate} --> ${formattedDates[i]}`));
        console.log('Formatted Dates Array:', formattedDates);

        // Call the function to check for dates after a specific date
        FindDatesAfter('2025-02-26', formattedDates);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

/**
 * Find and log dates after the given cutoff date.
 * @param {string} cutoffDate - The date to check against in YYYY-MM-DD format.
 * @param {string[]} datesArray - Array of dates in YYYY-MM-DD format.
 */
function FindDatesAfter(cutoffDate, datesArray) {
    const cutoff = new Date(cutoffDate);
    const datesAfterCutoff = datesArray.filter(date => new Date(date) > cutoff);

    if (datesAfterCutoff.length > 0) {
        console.log(`🚀 There are ${datesAfterCutoff.length} dates after ${cutoffDate}:`);
        console.log(datesAfterCutoff);
    } else {
        console.log(`✅ No dates after ${cutoffDate}.`);
    }
}