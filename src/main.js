import { load } from "cheerio"
import getUrls from 'get-urls'
import fetch from 'node-fetch'

main()

async function scrapeMagnets(url) {
    const urls = Array.from(getUrls(url))

    const requests = urls.map(async url => {
        const res = await fetch(url)
        const html = await res.text();

        const $ = load(html)

        return {
            url,
            name: $('.title').first().text(),
            fileSize: $('p[style="text-align: center;"]').children('em').text().replaceAll("File Size: ", ""),
            magnet: $('.nv-content-wrap p a[href*="magnet:?"]').attr('href')
        }
    })
    
    return Promise.all(requests)
}

function main() {
    const query = process.argv[2]
        .replace("--query=", "")
        .toLowerCase()
        .split(' ').join('-')
        .replace("\'", "")
    
    console.log(query)

    var res = scrapeMagnets(`https://freelinuxpcgames.com/${query}`)
    res.then(data => {
        console.log(data)
    })
}