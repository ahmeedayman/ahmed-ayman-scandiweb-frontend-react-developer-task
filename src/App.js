import "./App.css";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import React, { Component } from "react";
import { BrowserRouter as Router, Navigate } from "react-router-dom";
import { Routes, Route } from "react-router";

import NavBar from "./NavBar/NavBar.js";
import PLP from "./PLP/PLP";
import PDP from "./PDP/PDP";
import Cart from "./Cart/Cart";

export class App extends Component {
  constructor(props) {
    super(props);
    this.client = new ApolloClient({
      uri: "http://localhost:4000",
      cache: new InMemoryCache(),
    });
    this.state = {
      currency: "",
      currencySymbol: "",
      cart: {
        products: [],
      },
    };
  }

  // Store currency related code

  // (1) Allow the NavBar component to change store currency

  changeCurrencyFn = (currency, currencySymbol) => {
    this.setState({ currency: currency, currencySymbol: currencySymbol });
  };

  //Allow child components to update state

  updateState = (updatedState) => {
    this.setState(updatedState);
  };

  render() {
    return (
      <Router>
        <div
          className={
            this.state.overlayOpen ? "overlay-visible" : "overlay-hidden"
          }
        ></div>
        <NavBar
          client={this.client}
          changeCurrencyFn={this.changeCurrencyFn}
          currency={this.state.currency}
          currencySymbol={this.state.currencySymbol}
          cart={this.state.cart}
          updateGlobalState={this.updateState}
        />
        <Routes>
          <Route path="/" element={<Navigate replace to="/all" />} />

          <Route
            path="/all"
            element={
              <PLP
                client={this.client}
                currency={this.state.currency}
                currencySymbol={this.state.currencySymbol}
                category="all"
                cart={this.state.cart}
                updateGlobalState={this.updateState}
              />
            }
          />
          <Route
            path="/tech"
            element={
              <PLP
                client={this.client}
                currency={this.state.currency}
                currencySymbol={this.state.currencySymbol}
                category="tech"
                cart={this.state.cart}
                updateGlobalState={this.updateState}
              />
            }
          />
          <Route
            path="/clothes"
            element={
              <PLP
                client={this.client}
                currency={this.state.currency}
                currencySymbol={this.state.currencySymbol}
                category="clothes"
                cart={this.state.cart}
                updateGlobalState={this.updateState}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <PDP
                client={this.client}
                currency={this.state.currency}
                currencySymbol={this.state.currencySymbol}
                cart={this.state.cart}
                updateGlobalState={this.updateState}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <Cart
                currency={this.state.currency}
                currencySymbol={this.state.currencySymbol}
                cart={this.state.cart}
                updateGlobalState={this.updateState}
              />
            }
          />
        </Routes>
      </Router>
    );
  }
}

export default App;
