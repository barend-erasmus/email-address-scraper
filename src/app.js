const rp = require('request-promise');
const cheerio = require('cheerio');
const URL = require('url-parse');

async function scrape(scrapeUrl, level, maxLevel, scrapedLinks, resultEmailAddresses) {
    try {
        console.log(`Scaping ${scrapeUrl}`);

        const url = new URL(scrapeUrl);
        const baseUrl = url.protocol + "//" + url.hostname;

        const html = await rp({
            uri: scrapeUrl,
        });

        // 

        const emailAddresses = html.match(/[a-zA-Z0-9._-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,4}/g);

        if (emailAddresses) {
            console.log(`Found ${emailAddresses.length} email addresses`);

            resultEmailAddresses = resultEmailAddresses.concat(emailAddresses)
        }

        //

        const cheerioDocument = cheerio.load(html);

        console.log(`Title - ${cheerioDocument('title').text()}`);

        const relativeLinkElements = cheerioDocument("a[href^='/']");

        const links = [];

        relativeLinkElements.each((index, element) => {
            links.push(`${baseUrl}${element.attribs.href}`);
        });

        console.log(`Found ${links.length} links`);

        for (const link of links) {
            if (level < maxLevel) {
                if (scrapedLinks.indexOf(link) === -1) {
                    try {
                        const result = await scrape(link, level + 1, maxLevel, scrapedLinks);
                    } catch (err) {

                    }

                    scrapedLinks.push(link);
                }
            }
        }

    } catch (err) {

    }

    scrapedLinks.push(scrapeUrl);

    return {
        resultEmailAddresses,
        scrapedLinks,
    };
}

scrape('https://stackoverflow.com/', 0, 2, [], []).then((result) => {
    console.log(result.resultEmailAddresses);
    console.log(result.scrapedLinks.length);
});
