const {crawlPage} = require('./crawl');
const {printPages} = require('./report');
async function main() {
    if(process.argv.length < 3) {
        console.log("Usage: <URL>")
        process.exit(1);
    }
    if(process.argv.length > 3) {
        console.log("Usage: <URL>")
        process.exit(1);
    }
    const baseUrl = process.argv[2] ;
    console.log(`Starting crawl of: ${baseUrl}`);
    const pages = await crawlPage(baseUrl , baseUrl , {});
    printPages(pages);
}


main();