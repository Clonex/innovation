

export function inOfferCheck(name, offers)
{
    return offers.find(offer => {
        if(name.split(" ").includes("æg"))
        {
            return offer.name.split(" ").find(n => name.split(" ").includes(n)) || name.split(" ").find(n => offer.name.split(" ").includes(n));
        }
        return offer.name.includes(name) || name.includes(offer.name);
    });
}