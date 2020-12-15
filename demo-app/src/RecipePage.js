import React from "react";
import {inOfferCheck} from "./helpers";

import "./recipePage.css";
export default class RecipePage extends React.Component {
    state = {
        added: false,
    };

    goBack = () => {
        const check = !this.state.added || window.confirm("Hvis du går tilbage vil du se tilbud fra andre tilbuds aviser. Er du sikker på du vil gå tilbage?");
        console.log(check, !this.state.added);
        if(check)
        {
            this.props.setSelected(false);
        }
    }

    add = (ingredients) => {
        this.props.addIngredients(ingredients);
        this.setState({
            added: true,
        });
    };

    render(){
        console.log("Recipe", this.props);
        const data = this.props.recipe;
        const branding = this.props.dealerInfo[data.brandID];
        return (<div>
            <button onClick={() => this.goBack()} className="backBtn">
                Tilbage
            </button>
            <h1>{data.name}</h1>
            {
                data.images.length > 0 && <img src={`https://www.dk-kogebogen.dk/${data.images[0]}`} loading="auto"/>
            }
            <div className="container">
                <div className="ingredients">
                    {
                        data.ingredients.map(ing => {
                            const inOffers = inOfferCheck(ing.name.toLowerCase(), data.offers);
                            return (<div className="ingredient">
                                {ing.amount} {ing.measurement} - {ing.name}  {inOffers && <b>[I tilbudsavis]</b>}
                            </div>);
                        })
                    }
                    <button className="addTo" onClick={() => this.add(data.ingredients)}>
                        Tilføj til indkøbsliste
                    </button>
                </div>
                <div className="desc">
                    {
                        data.instructions.split("\n").map(d => <div>{d}</div>)
                    }
                </div>
            </div>
            <h2>Andre opskrifter fra {branding.name}</h2>
            <div className="recipies">
                {
                    this.props.recipes.filter((_, i) => i < 50).map((match, i) => {
                        const branding = this.props.dealerInfo[match.brandID];
                        return (<div className="recipe" key={i} onClick={() => this.props.setSelected(match.i)}>
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
        </div>);
    }
}