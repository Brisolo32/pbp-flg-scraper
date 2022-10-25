// Imports
const { load } = require("cheerio")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs-extra')

main() // Express all your hate to this main function

async function scrapeMagnets(url, cacheLoc) {
    // Checks if the cache file exists
    if (!fs.existsSync(cacheLoc)) {
        const res = await fetch(url)
        const html = await res.text();
        
        const $ = load(html) // jQuery
        const data = {
            "requests": [
                {
                    name: $('.title').first().text(),
                    fileSize: $('p[style="text-align: center;"]').children('em').text().replace("File Size: ", ""),
                    magnet: $('.nv-content-wrap p a[href*="magnet:?"]').attr('href')
                }
            ]
        }
        
        console.log(data)
        // Writes the data json to a file located at the cache location defined by the user
        fs.writeFileSync(cacheLoc, JSON.stringify(data))
    } else {        
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
        // Right here v
        existingFile.requests.push(data)
        fs.writeFileSync(cacheLoc, JSON.stringify(existingFile))
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