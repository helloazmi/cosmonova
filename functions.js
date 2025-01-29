function FindDatesAfter(cutoffDate, datesArray) {
    const cutoff = new Date(cutoffDate);
    const datesAfterCutoff = datesArray.filter(date => new Date(date) > cutoff);

    // console.log(`🚀 There are ${datesAfterCutoff.length} dates after ${cutoffDate}:`);
    // console.log(datesAfterCutoff);
    return {
        cutoffDate: cutoffDate,
        datesAfterCutoff: datesAfterCutoff,
        // msg: `🚀 There are ${datesAfterCutoff.length} dates after ${cutoffDate}: ${datesAfterCutoff}`
    }
}

const swedishMonths = {
    "januari": "01", "februari": "02", "mars": "03", "april": "04", "maj": "05",
    "juni": "06", "juli": "07", "augusti": "08", "september": "09", "oktober": "10",
    "november": "11", "december": "12"
};

// Export multiple functions
module.exports = { FindDatesAfter, swedishMonths };