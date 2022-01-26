import React, { Component } from "react";
import { Link } from "react-router-dom";

import classes from "./Cart.module.css";

import arrow from "../Images/arrow2.svg";
export class Cart extends Component {
  // apply style to selected attribute

  selectedAttributeStyle = (item, currentAttribute, product) => {
    const index = product.attributesObject.selectedAttributes.findIndex(
      (attribute) => {
        return attribute.attribute === currentAttribute.id;
      }
    );

    if (
      item.id ===
      product.attributesObject.selectedAttributes[index].selectedValue
    ) {
      return true;
    }
    return false;
  };

  // set cart counts

  setTotalItems = (products) => {
    let total = 0;
    products.forEach((product) => {
      total += product.amount;
    });
    return total;
  };

  setTotalPrice = (products) => {
    let total = 0;

    if (products.length > 0) {
      products.forEach((product) => {
        total +=
          product.prices.filter((price) => {
            return price.currency.label === this.props.currency;
          })[0].amount * product.amount;
      });
    }

    //display price to two decimal numbers

    if (total !== 0) {
      const stringTotal = total.toString();
      const decimalLocation = stringTotal.indexOf(".");
      total = +stringTotal.slice(0, decimalLocation + 3);
    }
    return total;
  };

  //Change amount in cart

  //Get product index in cart and update it
  updateAmount = (newAmount, productId) => {
    const index = this.props.cart.products.findIndex((product) => {
      return product.id === productId;
    });

    // remove from cart if the new amount is 0

    if (newAmount === 0) {
      return this.props.updateGlobalState({
        cart: {
          ...this.props.cart,
          products: [
            ...this.props.cart.products.slice(0, index),

            ...this.props.cart.products.slice(index + 1),
          ],
        },
      });
    }
    this.props.updateGlobalState({
      cart: {
        ...this.props.cart,
        products: [
          ...this.props.cart.products.slice(0, index),
          { ...this.props.cart.products[index], amount: newAmount },

          ...this.props.cart.products.slice(index + 1),
        ],
      },
    });
  };

  increaseAmountHandler = (e) => {
    const amount = +e.target.dataset.amount + 1;
    this.updateAmount(amount, e.target.dataset.id);
  };

  decreaseAmountHandler = (e) => {
    const amount = +e.target.dataset.amount - 1;
    this.updateAmount(amount, e.target.dataset.id);
  };

  //change displayed image
  displayAdjacentImage = (e, productId) => {
    const productIndex = this.props.cart.products.findIndex((product) => {
      return product.id === productId;
    });

    let index = this.props.cart.products[productIndex].displayedImage;
    if (
      index === this.props.cart.products[productIndex].gallery.length - 1 &&
      e.target.dataset.toWhichImage === "next"
    ) {
      index = -1;
    }
    this.props.updateGlobalState({
      cart: {
        ...this.props.cart,
        products: [
          ...this.props.cart.products.slice(0, productIndex),
          {
            ...this.props.cart.products[productIndex],
            displayedImage: index
              ? e.target.dataset.toWhichImage === "next"
                ? index + 1
                : index === 0
                ? this.cart.products[productIndex].gallery.length - 1
                : index - 1
              : e.target.dataset.toWhichImage === "next"
              ? 1
              : this.props.cart.products[productIndex].gallery.length - 1,
          },

          ...this.props.cart.products.slice(productIndex + 1),
        ],
      },
    });
  };
  render() {
    return (
      <main className={classes.main}>
        <h1 className={classes["cart-heading"]}>CART</h1>
        <p className={classes.total}>
          {" "}
          My Bag:{" "}
          <span className={classes["total-span"]}>
            {this.setTotalItems(this.props.cart.products)} items
          </span>
        </p>
        <div className={classes["all-products-wrapper"]}>
          {this.props.cart.products.length > 0 ? (
            <React.Fragment>
              {" "}
              {this.props.cart.products.map((product) => {
                return (
                  <div className={classes["product-wrapper"]} key={product.id}>
                    <div className={classes["details-wrapper"]}>
                      <Link
                        className={classes["to-product"]}
                        to={`/product/${product.id}`}
                      >
                        <h2 className={classes.brand}>{product.brand}</h2>
                        <h3 className={classes.name}>{product.name}</h3>
                      </Link>
                      <p className={classes.price}>
                        {this.props.currencySymbol}
                        {
                          product.prices.filter((price) => {
                            return price.currency.label === this.props.currency;
                          })[0].amount
                        }
                      </p>
                      {product.attributes.map((attribute) => {
                        return (
                          <React.Fragment key={attribute.id}>
                            <h4 className={classes["attribute-name"]}>
                              {attribute.name}:
                            </h4>
                            <div
                              className={classes["attribute-values-wrapper"]}
                            >
                              {attribute.items.map((item) => {
                                if (attribute.name === "Color") {
                                  return (
                                    <div
                                      className={
                                        this.selectedAttributeStyle(
                                          item,
                                          attribute,
                                          product
                                        )
                                          ? classes["selected-color-btn"]
                                          : classes["color-btn"]
                                      }
                                      style={{ background: item.value }}
                                      key={item.id}
                                    ></div>
                                  );
                                }

                                return (
                                  <button
                                    key={item.id}
                                    className={
                                      this.selectedAttributeStyle(
                                        item,
                                        attribute,
                                        product
                                      )
                                        ? classes["selected-value-btn"]
                                        : classes["value-btn"]
                                    }
                                  >
                                    {item.value}
                                  </button>
                                );
                              })}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className={classes["amount-btn-wrapper"]}>
                      <button
                        className={classes["amount-btn"]}
                        data-id={product.id}
                        data-amount={product.amount}
                        onClick={(e) => {
                          this.increaseAmountHandler(e);
                        }}
                      >
                        +
                      </button>{" "}
                      <p className={classes.amount}>{product.amount}</p>{" "}
                      <button
                        className={classes["amount-btn"]}
                        data-id={product.id}
                        data-amount={product.amount}
                        onClick={(e) => {
                          this.decreaseAmountHandler(e);
                        }}
                      >
                        -
                      </button>
                    </div>
                    <div className={classes["displayed-image-wrapper"]}>
                      {product.displayedImage ? (
                        <React.Fragment>
                          <img
                            className={classes["displayed-image"]}
                            src={product.gallery[product.displayedImage]}
                            alt=""
                          />
                          {product.gallery.length > 1 ? (
                            <div className={classes["arrow-div"]}>
                              <img
                                className={classes["previous-btn"]}
                                src={arrow}
                                alt="pervious button"
                                data-to-which-image="previous"
                                onClick={(e) => {
                                  this.displayAdjacentImage(e, product.id);
                                }}
                              />
                              <img
                                className={classes["next-btn"]}
                                src={arrow}
                                alt="next button"
                                data-to-which-image="next"
                                onClick={(e) => {
                                  this.displayAdjacentImage(e, product.id);
                                }}
                              />
                            </div>
                          ) : null}
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <img
                            src={product.gallery[0]}
                            alt=""
                            className={classes["displayed-image"]}
                          />
                          {product.gallery.length > 1 ? (
                            <div className={classes["arrow-div"]}>
                              <img
                                className={classes["previous-btn"]}
                                src={arrow}
                                alt="pervious button"
                                data-to-which-image="previous"
                                onClick={(e) => {
                                  this.displayAdjacentImage(e, product.id);
                                }}
                              />
                              <img
                                className={classes["next-btn"]}
                                src={arrow}
                                alt="next button"
                                data-to-which-image="next"
                                onClick={(e) => {
                                  this.displayAdjacentImage(e, product.id);
                                }}
                              />
                            </div>
                          ) : null}
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                );
              })}
              <p className={classes["total-price"]}>
                Total: {this.props.currencySymbol}
                {this.setTotalPrice(this.props.cart.products)}
              </p>
            </React.Fragment>
          ) : (
            <p className={classes["no-products-text"]}>
              No products in the cart.
            </p>
          )}
        </div>
      </main>
    );
  }
}

export default Cart;
