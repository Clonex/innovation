const cheerio = require("cheerio");
const fetch = require('node-fetch');
const fs = require('fs');

async function loadRecipe(id)
{
    const pageData = await fetch(`https://www.dk-kogebogen.dk/opskrifter/${id}/`).then(d => d.text()).catch(_ => false);
    if(pageData)
    {
        const dom = cheerio.load(pageData);
        const ingredients = [];
        const images = [];
        
        const page = dom('div[itemtype="http://schema.org/Recipe"]');
        const table = dom("#page_content > div:nth-child(8) > table > tbody > tr > td.page-content > div:nth-child(1) > table:nth-child(6) > tbody > tr > td:nth-child(2) > table:nth-child(3)");
        const rows = table.find("tr");
        rows.each((i) => {
            const elem = rows.eq(i);
            const tds = elem.find("td");

            ingredients.push({
                amount: tds.eq(0).text(),
                measurement: tds.eq(1).text(),
                name: tds.eq(2).find("span").eq(0).text(),
            });
        });

        const domImages = page.find('img');
        domImages.each((i) => {
            const elem = domImages.eq(i);
            images.push(elem.attr("src"));
        });

        return {
            name: dom('h1[itemprop="name"]').text(),
            amount: dom('span[itemprop="recipeYield"]').text(),
            cat: dom('span[itemprop="recipeCategory"]').text(),
            rating: dom('span[itemprop="ratingValue"]').text(),
            ratingAmount: dom('span[itemprop="ratingCount"]').text(),
            country: dom('span[itemprop="recipeCuisine"]').text(),
            instructions: dom('div[itemprop="recipeInstructions"]').text(),
            ingredients,
            images,
        };
    }
    return false;
}

let data = [];
let queue = [];

function startJob(amount)
{
    if(queue.length > 0)
    {
        const job = queue.pop();
        job().then(recipe => {
            data.push(recipe);
            console.log("Loaded", data.length);
            if(data.length >= amount)
            {
                console.timeEnd("load");
                console.log("Loaded all data!");
                fs.writeFileSync("data.json", JSON.stringify(data));
            }else{
                startJob(amount);
            }
        });
    }
}

async function crawl(amount = 100)
{
    console.time("load");

    const MAX_OPEN = 100;
    for(let i = 0; i < amount; i++)
    {
        queue.push(() => loadRecipe(i));
    }

    for(let i = 0; i < MAX_OPEN; i++)
    {
        startJob(amount);
    }
    
    setTimeout(() => {}, 1000 * 60 * 10);
}

crawl(40415);