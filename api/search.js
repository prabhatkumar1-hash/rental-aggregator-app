// api/search.js
// Vercel Serverless Function - Node.js
const axios = require('axios');
const cheerio = require('cheerio');

// Note: You need a scraper function for EACH site. This is a simplified example for one.
async function scrape99Acres(city, society) {
    // 1. Build the search URL (e.g., replace spaces with +)
    const url = `https://www.99acres.com/rent-property-in-${society}-${city}`;

    try {
        const { data } = await axios.get(url, {
            // Important: Set a User-Agent to avoid immediate blocking
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });

        const $ = cheerio.load(data);
        const results = [];
        
        // **This selector is HYPOTHETICAL and will need extensive testing/debugging.**
        $('.propertyTuple').each((i, el) => {
            const rent = $(el).find('.rent-price').text().trim();
            const details = $(el).find('.property-details').text().trim();

            if (rent) {
                results.push({
                    source: '99acres',
                    price: rent,
                    description: details,
                });
            }
        });

        return results.slice(0, 5); // Return only the top 5 results
    } catch (error) {
        console.error('99acres scraping failed:', error.message);
        return [{ source: '99acres', price: 'Data currently unavailable' }];
    }
}

// Main Vercel Function Handler
module.exports = async (req, res) => {
    // Vercel function runs here
    const { city, society } = req.query;

    if (!city || !society) {
        return res.status(400).send('Missing city or society query parameters.');
    }

    // Call ALL your scraper functions concurrently to save time
    const allResults = await Promise.all([
        scrape99Acres(city, society),
        // Add scrapeMagicBricks(city, society),
        // Add scrapeNoBroker(city, society),
    ]);
    
    // Flatten the array of results
    const aggregatedData = allResults.flat();

    res.status(200).json(aggregatedData);
};
