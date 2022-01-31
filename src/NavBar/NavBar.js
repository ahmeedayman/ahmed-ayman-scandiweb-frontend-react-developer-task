import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
import { gql } from "@apollo/client";

import classes from "./NavBar.module.css";

import logo from "../Images/logo.svg";
import arrow from "../Images/arrow.svg";
import arrow2 from "../Images/arrow2.svg";
import cartSVG from "../Images/Empty Cart.svg";

export class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      currencies: [],
      currencyDropdownOpen: false,
      cartDropdownOpen: false,
    };
  }
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
  // toggle cart and currency dropdowns on click

  toggleCurrencyDropdown = (e) => {
    e.stopPropagation();

    if (this.state.currencyDropdownOpen) {
      return this.setState({
        cartDropdownOpen: false,
        currencyDropdownOpen: false,
      });
    }
    this.props.updateGlobalState({ overlayOpen: false });

    this.setState({ cartDropdownOpen: false, currencyDropdownOpen: true });
  };

  toggleCartDropdown = (e) => {
    e.stopPropagation();
    if (this.state.cartDropdownOpen) {
      this.props.updateGlobalState({ overlayOpen: false });

      return this.setState({
        cartDropdownOpen: false,
        currencyDropdownOpen: false,
      });
    }
    this.props.updateGlobalState({ overlayOpen: true });

    this.setState({ cartDropdownOpen: true, currencyDropdownOpen: false });
  };

  closeCartDropdown = (e) => {
    e.stopPropagation();

    this.props.updateGlobalState({ overlayOpen: false });

    this.setState({
      cartDropdownOpen: false,
      currencyDropdownOpen: false,
    });
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

  //Change global store currency

  changeCurrencyHandler = (e) => {
    this.props.changeCurrencyFn(
      e.target.dataset.label,
      e.target.dataset.symbol
    );
  };

  //Change amount in cart

  //Get product index in cart and update it
  updateAmount = (newAmount, productId, productIndex) => {
    // remove from cart if the new amount is 0

    if (newAmount === 0) {
      return this.props.updateGlobalState({
        cart: {
          ...this.props.cart,
          products: [
            ...this.props.cart.products.slice(0, +productIndex),

            ...this.props.cart.products.slice(+productIndex + 1),
          ],
        },
      });
    }
    this.props.updateGlobalState({
      cart: {
        ...this.props.cart,
        products: [
          ...this.props.cart.products.slice(0, +productIndex),
          { ...this.props.cart.products[+productIndex], amount: newAmount },

          ...this.props.cart.products.slice(+productIndex + 1),
        ],
      },
    });
  };

  increaseAmountHandler = (e) => {
    const amount = +e.target.dataset.amount + 1;
    this.updateAmount(amount, e.target.dataset.id, e.target.dataset.index);
  };

  decreaseAmountHandler = (e) => {
    const amount = +e.target.dataset.amount - 1;
    this.updateAmount(amount, e.target.dataset.id, e.target.dataset.index);
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
    if (!this.state.categories.length > 0) {
      return null;
    }

    return (
      <nav className={classes.nav}>
        <div className={classes["nav-link-wrapper"]}>
          {this.state.categories.map((category) => {
            return (
              <NavLink
                className={({ isActive }) =>
                  isActive ? classes["nav-link-active"] : classes["nav-link"]
                }
                key={category.name}
                to={`/${category.name}`}
              >
                {category.name.toUpperCase()}
              </NavLink>
            );
          })}
        </div>

        <img alt="store logo" src={logo} className={classes.logo} />

        <div className={classes["dropdowns-wrapper"]}>
          <div
            onClick={(e) => {
              this.toggleCurrencyDropdown(e);
            }}
            className={classes["currency-dropdown-wrapper"]}
          >
            <button className={classes["current-currency"]}>
              {this.props.currencySymbol}{" "}
              <img
                src={arrow}
                alt=""
                className={
                  this.state.currencyDropdownOpen
                    ? classes["arrow-up"]
                    : classes["arrow-down"]
                }
              />
            </button>
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={
                this.state.currencyDropdownOpen
                  ? classes["currencies-dropdown-visible"]
                  : classes["currencies-dropdown-hidden"]
              }
            >
              {this.state.currencies.map((currency) => {
                return (
                  <button
                    className={classes["currency-btn"]}
                    key={currency.label}
                    data-label={currency.label}
                    data-symbol={currency.symbol}
                    onClick={(e) => {
                      this.changeCurrencyHandler(e);
                      this.toggleCurrencyDropdown(e);
                    }}
                  >
                    {currency.symbol} {currency.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={classes["cart-dropdown-wrapper"]}
          >
            <div
              className={classes["cart-button-wrapper"]}
              onClick={(e) => {
                this.toggleCartDropdown(e);
              }}
            >
              <img
                className={classes["cart-button"]}
                alt="cart"
                src={cartSVG}
              />
              {this.setTotalItems(this.props.cart.products) ? (
                <p className={classes["total-attached"]}>
                  {this.setTotalItems(this.props.cart.products)}
                </p>
              ) : null}
            </div>
            <div
              className={
                this.state.cartDropdownOpen
                  ? classes["cart-dropdown-visible"]
                  : classes["cart-dropdown-hidden"]
              }
            >
              {this.props.cart.products.length > 0 ? (
                <React.Fragment>
                  <p className={classes["total-items"]}>
                    My Bag:{" "}
                    <span className={classes["total-span"]}>
                      {this.setTotalItems(this.props.cart.products)} items
                    </span>
                  </p>
                  {this.props.cart.products.map((product, index) => {
                    return (
                      <div
                        key={`${product.id} ${index}`}
                        className={classes["product-wrapper"]}
                      >
                        <div className={classes["details-div"]}>
                          <Link
                            className={classes["to-product"]}
                            to={`/product/${product.id}`}
                            onClick={(e) => {
                              this.toggleCartDropdown(e);
                            }}
                          >
                            <p className={classes.brand}>{product.brand}</p>
                            <p className={classes.name}>{product.name}</p>
                          </Link>
                          <p className={classes.price}>
                            {this.props.currencySymbol}
                            {
                              product.prices.filter((price) => {
                                return (
                                  price.currency.label === this.props.currency
                                );
                              })[0].amount
                            }
                          </p>
                          {product.attributes.map((attribute) => {
                            return (
                              <React.Fragment key={attribute.id}>
                                <p className={classes["attribute-name"]}>
                                  {attribute.name}:
                                </p>
                                <div
                                  className={
                                    classes["attribute-values-wrapper"]
                                  }
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
                            data-index={index}
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
                            data-index={index}
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
                                    src={arrow2}
                                    alt="pervious button"
                                    data-to-which-image="previous"
                                    onClick={(e) => {
                                      this.displayAdjacentImage(e, product.id);
                                    }}
                                  />
                                  <img
                                    className={classes["next-btn"]}
                                    src={arrow2}
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
                                className={classes["displayed-image"]}
                                src={product.gallery[0]}
                                alt=""
                              />
                              {product.gallery.length > 1 ? (
                                <div className={classes["arrow-div"]}>
                                  <img
                                    className={classes["previous-btn"]}
                                    src={arrow2}
                                    alt="pervious button"
                                    data-to-which-image="previous"
                                    onClick={(e) => {
                                      this.displayAdjacentImage(e, product.id);
                                    }}
                                  />
                                  <img
                                    className={classes["next-btn"]}
                                    src={arrow2}
                                    alt="next button"
                                    data-to-which-image="next"
                                    onClick={(e) => {
                                      this.displayAdjacentImage(e, product.id);
                                    }}
                                  />
                                </div>
                              ) : null}{" "}
                            </React.Fragment>
                          )}
                        </div>
                      </div>
                    );
                  })}{" "}
                  <p className={classes["total-price"]}>
                    Total: {this.props.currencySymbol}
                    {this.setTotalPrice(this.props.cart.products)}
                  </p>
                  <div className={classes["to-cart-div"]}>
                    <Link
                      onClick={(e) => {
                        this.toggleCartDropdown(e);
                      }}
                      className={classes["to-bag-btn"]}
                      to="/cart"
                    >
                      VIEW BAG
                    </Link>
                    <Link
                      onClick={(e) => {
                        this.toggleCartDropdown(e);
                      }}
                      className={classes["checkout-btn"]}
                      to="/cart"
                    >
                      CHECK OUT
                    </Link>
                  </div>
                </React.Fragment>
              ) : (
                <p className={classes["no-products-text"]}>
                  No products in the cart.
                </p>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  //Get categories and available currencies

  componentDidMount() {
    const getCategories = async () => {
      const res = await this.props.client.query({
        query: gql`
          query {
            categories {
              name
            }
            currencies {
              label
              symbol
            }
          }
        `,
      });

      this.setState({
        categories: [...res.data.categories],
        currencies: [...res.data.currencies],
      });
      this.props.changeCurrencyFn(
        res.data.currencies[0].label,
        res.data.currencies[0].symbol
      );
    };

    getCategories();
    //close dropdowns on click outside them

    document.body.addEventListener("click", () => {
      if (this.state.cartDropdownOpen || this.state.currencyDropdownOpen) {
        this.setState({ currencyDropdownOpen: false, cartDropdownOpen: false });
        this.props.updateGlobalState({ overlayOpen: false });
      }
    });
  }
}

export default NavBar;
