import { load } from "cheerio"
import getUrls from 'get-urls'
import fetch from 'node-fetch'
import fs from 'node:fs'

main()

async function scrapeMagnets(url, cacheLoc) {
    if (!fs.existsSync(cacheLoc)) {
        const urls = Array.from(getUrls(url))

        const requests = urls.map(async url => {
            const res = await fetch(url)
            const html = await res.text();
    
            const $ = load(html)
            const data = {
                "requests": [
                    {
                        name: $('.title').first().text(),
                        fileSize: $('p[style="text-align: center;"]').children('em').text().replace("File Size: ", ""),
                        magnet: $('.nv-content-wrap p a[href*="magnet:?"]').attr('href')
                    }
                ]
            }
    
            fs.writeFileSync(cacheLoc, JSON.stringify(data))
        })
    } else {
        const urls = Array.from(getUrls(url))
        const requests = urls.map(async url => {
            const existingFile = JSON.parse(fs.readFileSync(cacheLoc))

            const res = await fetch(url)
            const html = await res.text();
    
            const $ = load(html)
            const data = {
                name: $('.title').first().text(),
                fileSize: $('p[style="text-align: center;"]').children('em').text().replace("File Size: ", ""),
                magnet: $('.nv-content-wrap p a[href*="magnet:?"]').attr('href')
            }

            existingFile.requests.push(data)
            fs.writeFileSync(cacheLoc, JSON.stringify(existingFile))
        })
    }
}

function main() {
    const query = process.argv[2]
        .replace("--query=", "")
        .toLowerCase()
        .split(' ').join('-')
        .replace("\'", "")
    
    const cache = process.argv[3]
        .replace("--cache=", "")

    console.log(`Query: ${query}\nCache Location: ${cache}`)

    scrapeMagnets(`https://freelinuxpcgames.com/${query}`, cache)
}