import React from "react";
import RecipePage from "./RecipePage";
import CartPage from "./CartPage";

import {inOfferCheck} from "./helpers";

import receipies from "./data.json";
import "./overviewPage.css";

export default class OverviewPage extends React.Component {
    state = {
        loading: true,
        loadingText: "Loading..",
        recipes: receipies.filter(d => d.images.length > 0 && d.name.length > 0).map(d => ({
            ...d,
            ingredients: d.ingredients.map(d => ({...d, name: d.name.trim()})).filter(ing => ing.name.length > 0),
        })),
        offers: [],
        matches: [],
        dealerInfo: {},

        selected: false,
        cartOpen: false,

        cart: [],
    };

    async componentDidMount()
    {
        await this.loadOffers();
        setTimeout(() => this.matchOffers(), 200);
    }

    matchOffers(){
        console.log("Matching offers");
        const blackList = [];//"mælk", "vand", "mel", "hvedemel", "salt", "sukker", "peber", "kanel", "rapsolie", "ris", "bullion", "karry", "dild", "paprika", "chilli", "hvidløgspulver", "oregano", "basilikum", "timian"]; //"smør", 
        let matches = [];
        const data = this.state.recipes;

        const shopOffers = this.state.offers.reduce((obj, offer) => {
            if(!obj[offer.dealer])
            {
                obj[offer.dealer] = [];
            }
            obj[offer.dealer].push(offer);
            return obj;
        }, {});
        const groupKeys = Object.keys(shopOffers);

        for(let i = 0; i < data.length; i++)
        {
            // if(i%100 === 0)
            // {
            //     console.log("Matched", i, "/", data.length);
            // }
            const recipe = data[i];
            let allOffers = [];

            for(let groupI = 0; groupI < groupKeys.length; groupI++)
            {
                const tempRecipe = {...recipe};
                tempRecipe.offers = [];
                const groupKey = groupKeys[groupI];
                const offers = shopOffers[groupKey];
                for(let j = 0; j < recipe.ingredients.length; j++)
                {
                    const ing = recipe.ingredients[j];
                    const name = ing.name.trim().toLowerCase();
                    if(name.length > 0)
                    {
                        const ingredientOffer = inOfferCheck(name, offers);
                        const blackListCheck = false;//blackList.find(n => name.includes(n));
                        if(!ingredientOffer && !blackListCheck)
                        {
                            continue;
                        }
                        tempRecipe.brandID = ingredientOffer.brandID;
                        tempRecipe.offers.push(ingredientOffer);
                    }
                }
                allOffers.push(tempRecipe);
                if(tempRecipe.offers.length >= tempRecipe.ingredients.length)
                {
                    break;
                }
            }

            const bestMatch = allOffers.sort((a, b) => a.offers.length - b.offers.length);
            matches.push(bestMatch[0]);
        }
        
        matches = matches.filter(d => d.offers.length > 0)
                .sort((a, b) => Number(b.rating) - Number(a.rating)) // Sort by one with most ingredients first
                .sort((a, b) => ((b.offers.length / b.ingredients.length)) - ((a.offers.length  / a.ingredients.length))); // Sort by recipies with most of their ingredrients first
        console.log("Matches", matches);

        this.setState({
            matches: matches.filter(d => d.cat === "Hovedretter").map((d, i) => ({...d, i})),//.sort((a, b) => b.images.length - a.images.length),
            loading: false,
            loadingText: "Færdiggøre..",
        });
    }

    async loadOffers()
    {
        const dealers = ["267e1m", "101cD", "98b7e", "9ba51", "11deC", "71c90", "0b1e8", "93f13", "bdf5A"];
        let offers = [];
        let dealerInfo = {};
        for(let dI = 0; dI < dealers.length; dI++)
        {
            const catalogs = await window.SGN.CoreKit.request({
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
                dealerInfo[catalog.id] = catalog.branding;
                console.log("Loading", catalog.label);
                this.setState({
                    loadingText: `Behandler avis "${catalog.label}"`,
                });
                var bootstrapper = new window.SGN.PagedPublicationKit.Bootstrapper({
                    id: catalog.id
                });
                const hotSpots = await (new Promise(r => bootstrapper.fetchHotspots((err, data) => r(data))));
                // console.log(hotSpots);
                hotSpots.forEach(offer => {
                    offers.push({
                        name: offer.heading.toLowerCase(),
                        price: offer.offer.pricing.price,
                        brandID: catalog.id,
                        dealer: dealers[dI],
                    });
                });
            }
        }
        
        this.setState({
            loadingText: "Matcher tilbud",
            offers,
            dealerInfo
        });
    }

    setSelected = (i) => {
        this.setState({selected: i});
        window.scrollTo(0, 0);
    }

    render()
    {
        if(this.state.loading)
        {
            return (<div className="loading">{this.state.loadingText}</div>);
        }
        const selected = this.state.matches[this.state.selected];
        const IN_RECIPE = typeof this.state.selected === "number";
        return  (<div className="basePageContainer">
                <div className="basePage">
                    {
                        this.state.cartOpen ? <CartPage
                            data={this.state.cart}
                            setSelected={this.setSelected}
                            updateIngredients={(cart) => this.setState({
                                cart
                            })}
                        />
                        : <React.Fragment>
                            <div className="cart" onClick={() => this.setState({cartOpen: true})}>
                                <div className="cartAmount">{this.state.cart.length}</div>
                                <i className="fa fa-th-list" aria-hidden="true"/>
                            </div>
                            {
                            IN_RECIPE && <RecipePage
                                recipe={selected}
                                recipes={this.state.matches.filter(d => d.brandID === selected.brandID && d.i !== selected.i)}
                                dealerInfo={this.state.dealerInfo}
                                setSelected={this.setSelected}
                                addIngredients={(ings) => this.setState({
                                    cart: [
                                        ...this.state.cart,
                                        ...ings
                                    ]
                                })}
                            />
                        }
                        
                            <div className="overview" style={IN_RECIPE ? {display: "none"} : {}}>
                                <h1>Opskrifter</h1>
                                <div className="recipies">
                                {
                                    this.state.matches.filter((d, i) => i < 100).map((match, i) => {
                                        const branding = this.state.dealerInfo[match.brandID];
                                        return (<div className="recipe" key={i} onClick={() => this.setSelected(i)}>
                                            <div className="imageContainer">
                                                {
                                                    match.images.length > 0 && <img src={`https://www.dk-kogebogen.dk/${match.images[0]}`} loading="auto"/>
                                                }
                                                <img className="brandLogo" src={branding.logo} loading="auto"/>
                                            </div>
                                            <div className="name">
                                                <b>{match.name}</b>
                                            </div>
                                        </div>);
                                    })
                                }
                            </div>
                        </div>
                        </React.Fragment>
                    }
                    
            </div>
        </div>);
    }

}