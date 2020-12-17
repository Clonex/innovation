import React from "react";

export default class CartPage extends React.Component {
    state = {
        shopAmount: 1,
    };

    render()
    {
        return (<div className="cartContainer">
            <button onClick={() => this.goBack()} className="backBtn">
                Tilbage
            </button>

            <h1>Indkøbsliste</h1>
            <div className="container">
                {
                    this.props.data.map((ing, key) => <div key={key}>
                        {ing.name}
                    </div>)
                }
            </div>
            
            <b>Hvor mange forskellige butikker vil du handle i?</b>
            <input type="range" min="1" max="10" defaultValue="1" onChange={(e) => this.setState({
                shopAmount: e.target.value
            })}/>
            {this.state.shopAmount}
        </div>);
    }
}