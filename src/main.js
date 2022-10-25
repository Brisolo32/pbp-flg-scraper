// Imports
import { load } from "cheerio"
import getUrls from 'get-urls'
import fetch from 'node-fetch'
import fs from 'node:fs'

main() // fucking piece of shit no one likes you you fucking piece of shit
       // that wasn't directed at you that was directed at that main func

async function scrapeMagnets(url, cacheLoc) {
    // Checks if the cache file exists
    if (!fs.existsSync(cacheLoc)) {
        const urls = Array.from(getUrls(url))

        const requests = urls.map(async url => {
            const res = await fetch(url)
            const html = await res.text();
            
            const $ = load(html) // jQuery
            const data = {
                "requests": [
                    {
                        // Name of the game ( EX: Terraria (1.4.0.8) )
                        name: $('.title').first().text(),
                        
                        // Game size ( EX: 683 MB )
                        fileSize: $('p[style="text-align: center;"]').children('em').text().replace("File Size: ", ""),

                        // Magnet link ( Torrent... )
                        magnet: $('.nv-content-wrap p a[href*="magnet:?"]').attr('href')
                    }
                ]
            }
            
            // Writes the data json to a file located at the cache location defined by the user
            fs.writeFileSync(cacheLoc, JSON.stringify(data))
        })
    } else {
        const urls = Array.from(getUrls(url))
        const requests = urls.map(async url => {
            // Same thing as the other but this time it pushes the data to the same json

            const existingFile = JSON.parse(fs.readFileSync(cacheLoc))

            const res = await fetch(url)
            const html = await res.text();
    
            const $ = load(html)
            const data = {
                name: $('.title').first().text(),
                fileSize: $('p[style="text-align: center;"]').children('em').text().replace("File Size: ", ""),
                magnet: $('.nv-content-wrap p a[href*="magnet:?"]').attr('href')
            }

            //            |
            // Right here V
            existingFile.requests.push(data)
            fs.writeFileSync(cacheLoc, JSON.stringify(existingFile))
        })
    }
}

function main() {
    // Creates 2 constants: query and cache
    const query = process.argv[2]
        .replace("--query=", "")
        .toLowerCase()
        .split(' ').join('-')
        .replace("\'", "")
    
    const cache = process.argv[3]
        .replace("--cache=", "")

    // Logs them for fun
    console.log(`Query: ${query}\nCache Location: ${cache}`)
    scrapeMagnets(`https://freelinuxpcgames.com/${query}`, cache)
}