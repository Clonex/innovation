import data from "./data.js";

export default class Crawl {

    constructor()
    {
        this.run();
    }

    async run()
    {
        const blackList = ["mælk", "vand", "mel", "hvedemel", "salt", "sukker", "peber", "kanel", "rapsolie", "ris"]; //"smør", 
        const dealers = ["267e1m", "98b7e", "101cD", "9ba51", "11deC", "71c90", "0b1e8", "93f13", "bdf5A"]
        
        let matches = [];

        for(let dI = 0; dI < dealers.length; dI++)
        {
            let offers = [];
            const catalogs = await SGN.CoreKit.request({
                url: '/v2/catalogs',
                qs: {
                    dealer_id: dealers[dI],
                    order_by: "-valid_date",
                    offset: 0,
                    limit: 4
                }
            });
            for(let i = 0; i < catalogs.length; i++)
            {
                const catalog = catalogs[i];
                console.log("Loading", catalog.label);
                var bootstrapper = new SGN.PagedPublicationKit.Bootstrapper({
                    id: catalog.id
                });
                const hotSpots = await (new Promise(r => bootstrapper.fetchHotspots((err, data) => r(data))));
                // console.log(hotSpots);
                hotSpots.forEach(offer => {
                    offers.push({
                        name: offer.heading.toLowerCase(),
                        price: offer.offer.pricing.price 
                    });
                });
            }

            // console.log(offers);
            for(let i = 0; i < data.length; i++)
            {
                const recipe = data[i];
                if(recipe.name.length === 0)
                {
                    continue;
                }
                recipe.offers = [];
                let hasMatched = true;
                for(let j = 0; j < recipe.ingredients.length; j++)
                {
                    const ing = recipe.ingredients[j];
                    const name = ing.name.trim().toLowerCase();
                    if(name.length > 0)
                    {
                        const check = offers.find(offer => offer.name.includes(name) || name.includes(offer.name));
                                                //.find(offer => offer.name.split(" ").find(n => name.split(" ").includes(n)) || name.split(" ").find(n => offer.name.split(" ").includes(n)));
                        const blackListCheck = blackList.find(n => n.includes(name) || name.includes(n));
                        if(!check && !blackListCheck)
                        {
                            hasMatched = false;
                            break;
                        }
                        recipe.offers.push(check);
                    }
                }

                if(hasMatched && recipe.offers.length > 1)
                {
                    matches.push({
                        ...recipe,
                        i
                    });
                }
            }
        }
        

        console.log("Matches", matches.filter(d => d.cat === "Hovedretter").filter((d, i, arr) => arr.findIndex(a => a.name === d.name) === i));
        
    }
};

/*
    window.onload = async () => {
                let offers = [];
                const catalogs = await SGN.CoreKit.request({
                    url: '/v2/catalogs',
                    qs: {
                        dealer_id: "267e1m",
                        order_by: "-valid_date",
                        offset: 0,
                        limit: 4
                    }
                });
                for(let i = 0; i < catalogs.length; i++)
                {
                    const catalog = catalogs[i];
                    console.log("Catalogs", catalog);
                    var bootstrapper = new SGN.PagedPublicationKit.Bootstrapper({
                        id: catalog.id
                    });
                    const hotSpots = await (new Promise(r => bootstrapper.fetchHotspots((err, data) => r(data))));
                    console.log(hotSpots);
                    hotSpots.forEach(offer => {
                        offers.push({
                            name: offer.heading,
                            price: offer.offer.pricing.price 
                        });
                    });
                }

                console.log(offers);
            };
*/