const {JSDOM} = require("jsdom");

async function crawlPage(baseURL , crawlURL , pages) {
    const baseURLObj = new URL(baseURL)
    const crawlURLObj = new URL(crawlURL);
    if(baseURLObj.hostname !== crawlURLObj.hostname){
        return pages ;
    }
    const normalizedCrawlURL = normalizeUrl(crawlURLObj);
    if(pages[normalizedCrawlURL] > 0){
        pages[normalizedCrawlURL]++ ;
        return pages ;
    }
    pages[normalizedCrawlURL] = 1;

    console.log(`Actively crawling: ${crawlURL}`);
    try {
        const responseObject = await fetch(crawlURL);
        if(responseObject.status > 399) {
            console.error(`Error in fetch with status code: ${responseObject.status} on page: ${crawlURL}`);
            return pages;
        }
        const contentType = responseObject.headers.get("content-type");
        if(!contentType.includes("text/html")) {
            console.error(`Non html response, content type: ${contentType} on page: ${crawlURL}`);
            return pages ;
        }
        const htmlBody = await responseObject.text();
        const nextURLs =  getURLsFromHTML(htmlBody , baseURL);
        for(const nextURL of nextURLs){
            pages = await crawlPage(baseURL , nextURL , pages);
        }
    }catch(err) {
        console.error(`Error in fetch: ${err.message}, on page: ${crawlURL}`);
    }
    return pages ;

}

function normalizeUrl(url){
    const normalized = new URL(url)
    const hostPath = `${normalized.hostname}${normalized.pathname}` ;
    if(hostPath.length > 0 && hostPath.slice(-1) === '/') {
        return hostPath.slice(0 , -1) ;
    }
    return hostPath;
}

function getURLsFromHTML(htmlBody , baseURL) {
    const urls = [] ;
    const dom = new JSDOM(htmlBody);
    const linkElements = dom.window.document.querySelectorAll("a") ;
    for(const linkElement of linkElements){
        if(linkElement.href.slice(0 , 1) === '/'){ // Relative url
            try {
                const urlObj = new URL(`${baseURL}${linkElement.href}`);
                urls.push(urlObj.href);
            }catch(e) {
                console.log(`Error with relative url :${e.message}`) ;
            }
        }else {
            try {
                const urlObj = new URL(linkElement.href);
                urls.push(urlObj.href);
            }catch(e) {
                console.log(`Error with relative url :${linkElement.href}`);
            }
        }
    }
    return urls ;
}

module.exports = {normalizeUrl , getURLsFromHTML  , crawlPage};