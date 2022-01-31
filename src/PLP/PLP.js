import React, { Component } from "react";
import { gql } from "@apollo/client";
import { Link } from "react-router-dom";

import Spinner from "../Spinner/Spinner";
import classes from "./PLP.module.css";

import cartSVG from "../Images/Cart2.svg";

export class PLP extends Component {
  state = { products: [], attributesList: [], productToAdd: {} };

  //Fetch products depending on category

  getProducts = async () => {
    this.setState({ products: [] });
    const res = await this.props.client.query({
      query: gql`
            query {
              category(input: {title: "${window.location.pathname.slice(1)}"}) {
                products {
                  id
                  name
                  inStock
                  gallery
                  description
                  category
                  attributes {
                    id
                    name
                    type
                    items {
                      displayValue
                      value
                      id
                    }
                  }
                  prices {
                    currency {
                      label
                      symbol
                    }
                    amount
                  }
                  brand
                }
              }
            }
          `,
    });

    // Add each product to the state of the PLP component, then, for each product, adds a default value for each attribute

    res.data.category.products.forEach((product) => {
      let attributesObject = {};
      product.attributes.forEach((attribute) => {
        attributesObject = {
          // the ternary operator is necessary because selectedAttributes is undefined at first

          selectedAttributes: attributesObject.selectedAttributes
            ? [
                ...attributesObject.selectedAttributes,
                {
                  attribute: attribute.id,
                  selectedValue: attribute.items[0].id,
                },
              ]
            : [
                {
                  attribute: attribute.id,
                  selectedValue: attribute.items[0].id,
                },
              ],
        };
      });
      this.setState({
        products: [
          ...this.state.products,
          {
            ...product,
            attributesObject,
          },
        ],
      });
    });
  };
  // When clicking on add to cart for a product, a popup appears to pick the attributes.

  //close popup

  closePopup = (product) => {
    //reset selected values

    this.state.attributesList.forEach((currentAttribute) => {
      let attributeToUse = product.attributes.filter((attribute) => {
        return attribute.id === currentAttribute.attribute;
      })[0];
      currentAttribute.selectedValue = attributeToUse.items[0].id;
    });

    // prevent scrolling to the top of page

    const pageY = window.scrollY;
    window.location.assign(`#`);
    window.scrollBy(0, pageY);
  };

  //apply a class to only the selected attribute value

  findSelectedValue = (item, currentAttribute, attributesList) => {
    let attributeIndex = attributesList.findIndex((attributeDetails) => {
      return attributeDetails.attribute === currentAttribute.id;
    });

    if (attributeIndex !== -1) {
      if (item.id === attributesList[attributeIndex].selectedValue) {
        return true;
      }
      return false;
    }
  };
  // reset attributes when clicking add to cart on a new product.

  resetAttributesHandler = (product) => {
    this.setState({
      attributesList: [...product.attributesObject.selectedAttributes],
    });
  };

  selectAttribute = (e) => {
    const index = this.state.attributesList.findIndex((attribute) => {
      return attribute.attribute === e.target.dataset.attributeId;
    });

    this.setState({
      attributesList: [
        ...this.state.attributesList.slice(0, index),
        {
          ...this.state.attributesList[index],
          selectedValue: e.target.dataset.id,
        },
        ...this.state.attributesList.slice(index + 1),
      ],
    });
  };

  addProductToCart = (e, product) => {
    this.setState({
      productToAdd: {
        ...this.state.products.filter((product) => {
          return product.id === e.target.dataset.productId;
        })[0],
      },
    });

    //Check the attributes that were changed, and if they exist, change them.

    setTimeout(() => {
      this.state.attributesList.forEach((attribute) => {
        if (this.state.productToAdd.attributesObject) {
          this.state.productToAdd.attributesObject.selectedAttributes.forEach(
            (defaultAttribute, index) => {
              if (defaultAttribute.attribute === attribute.attribute) {
                // defaultAttribute.selectedValue = attribute.selectedValue;
                this.setState({
                  productToAdd: {
                    ...this.state.productToAdd,
                    attributesObject: {
                      selectedAttributes: [
                        ...this.state.productToAdd.attributesObject.selectedAttributes.slice(
                          0,
                          index
                        ),
                        {
                          ...this.state.productToAdd.attributesObject
                            .selectedAttributes[index],
                          selectedValue: attribute.selectedValue,
                        },
                        ...this.state.productToAdd.attributesObject.selectedAttributes.slice(
                          index + 1
                        ),
                      ],
                    },
                  },
                });
              }
            }
          );
        }
      });

      // if the product is already in cart and with same attributes, increase amount in cart

      setTimeout(() => {
        const similarProductInCartIndex = this.props.cart.products.findIndex(
          (cartProduct) => {
            return (
              cartProduct.id === this.state.productToAdd.id &&
              this.state.productToAdd.attributesObject.selectedAttributes.every(
                (selectedAttribute) => {
                  return cartProduct.attributesObject.selectedAttributes.some(
                    (cartSelectedAttribute) => {
                      return (
                        cartSelectedAttribute.attribute ===
                          selectedAttribute.attribute &&
                        cartSelectedAttribute.selectedValue ===
                          selectedAttribute.selectedValue
                      );
                    }
                  );
                }
              )
            );
          }
        );

        if (similarProductInCartIndex !== -1) {
          this.props.updateGlobalState({
            cart: {
              ...this.props.cart,
              products: [
                ...this.props.cart.products.slice(0, similarProductInCartIndex),
                {
                  ...this.props.cart.products[similarProductInCartIndex],
                  amount:
                    this.props.cart.products[similarProductInCartIndex].amount +
                    1,
                },
                ...this.props.cart.products.slice(
                  similarProductInCartIndex + 1
                ),
              ],
            },
          });
          return this.closePopup(product);
        }

        // If not, add to cart.

        this.props.updateGlobalState({
          cart: {
            ...this.props.cart,
            products: [
              ...this.props.cart.products,
              { ...this.state.productToAdd, amount: 1 },
            ],
          },
        });

        this.closePopup(product);
      }, 0);
    }, 0);
  };

  // the following functions check whether the product is already in the cart or if it's not in stock.
  // if already in the cart, return a button to remove it.
  // if not in stock, return a button that doesn't allow to add to cart.

  removeFromCartHandler = (e) => {
    const unremovedProducts = this.props.cart.products.filter((product) => {
      return product.id !== e.target.dataset.id;
    });

    this.props.updateGlobalState({
      cart: {
        ...this.props.cart,
        products: [...unremovedProducts],
      },
    });
  };

  checkIfInStock = (product) => {
    if (!product.inStock) {
      return (
        <button className={classes["not-in-stock-btn"]}>
          <img src={cartSVG} alt="" />
        </button>
      );
    }

    return (
      <a
        href={`#${product.id}`}
        className={classes["add-btn"]}
        onClick={() => {
          this.resetAttributesHandler(product);
        }}
      >
        <img src={cartSVG} alt="" />
      </a>
    );
  };

  render() {
    if (!this.state.products.length > 0) {
      return <Spinner />;
    }

    return (
      <main className={classes.main}>
        <h1 className={classes["category-name"]}>
          {this.props.category.toUpperCase()}
        </h1>
        <div className={classes["products-wrapper"]}>
          {this.state.products.map((product) => {
            //if not in stock, display a text on the product image.
            let inStockText = null;
            if (!product.inStock) {
              inStockText = (
                <div className={classes["not-in-stock-wrapper"]}>
                  <p className={classes["not-in-stock-text"]}>OUT OF STOCK</p>
                </div>
              );
            }

            //pick the currency of the store from the array of prices

            let price = product.prices.filter((price) => {
              return price.currency.label === this.props.currency;
            })[0];

            return (
              <div className={classes["product-card"]} key={product.id}>
                <div className={classes["image-wrapper"]}>
                  <Link
                    className={classes["to-product-1"]}
                    to={`/product/${product.id}`}
                  >
                    {" "}
                    <img
                      alt=""
                      src={product.gallery[0]}
                      className={classes.img}
                    />{" "}
                    {inStockText}
                  </Link>
                  {this.checkIfInStock(product)}
                </div>

                <Link
                  className={classes["to-product-2"]}
                  to={`/product/${product.id}`}
                >
                  <h2 className={classes.brand}>{product.brand}</h2>
                  <h3 className={classes.name}>{product.name}</h3>
                  <h4 className={classes.price}>
                    {this.props.currencySymbol} {price.amount}
                  </h4>
                </Link>

                <div className={classes["popup-overlay"]} id={product.id}>
                  <div className={classes.popup}>
                    <h4 className={classes["details-heading"]}>
                      Pick product details:
                    </h4>
                    {product.attributes.map((attribute) => {
                      if (attribute.name === "Color") {
                        return (
                          <React.Fragment key={attribute.id}>
                            <h3 className={classes["attribute-name"]}>
                              {attribute.name}:
                            </h3>
                            <div
                              className={classes["attribute-values-wrapper"]}
                            >
                              {attribute.items.map((item) => {
                                return (
                                  <button
                                    className={
                                      this.findSelectedValue(
                                        item,
                                        attribute,
                                        this.state.attributesList
                                      )
                                        ? classes["selected-color-btn"]
                                        : classes["color-btn"]
                                    }
                                    style={{ background: item.value }}
                                    key={item.id}
                                    data-id={item.id}
                                    data-attribute-id={attribute.id}
                                    onClick={(e) => {
                                      this.selectAttribute(e);
                                    }}
                                  ></button>
                                );
                              })}
                            </div>
                          </React.Fragment>
                        );
                      }
                      return (
                        <React.Fragment key={attribute.id}>
                          <h3 className={classes["attribute-name"]}>
                            {attribute.name}:
                          </h3>
                          <div className={classes["attribute-values-wrapper"]}>
                            {attribute.items.map((item) => {
                              return (
                                <button
                                  className={
                                    this.findSelectedValue(
                                      item,
                                      attribute,
                                      this.state.attributesList
                                    )
                                      ? classes["selected-value-btn"]
                                      : classes["value-btn"]
                                  }
                                  key={item.id}
                                  data-id={item.id}
                                  data-attribute-id={attribute.id}
                                  onClick={(e) => {
                                    this.selectAttribute(e);
                                  }}
                                >
                                  {item.value}
                                </button>
                              );
                            })}
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div className={classes["btn-wrapper"]}>
                      <button
                        className={classes.accept}
                        data-product-id={product.id}
                        onClick={(e) => {
                          this.addProductToCart(e, product);
                        }}
                      >
                        ACCEPT
                      </button>
                      <button
                        onClick={() => {
                          this.closePopup(product);
                        }}
                        className={classes.cancel}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  componentDidMount() {
    this.getProducts();
  }

  // If we click on the same category twice, we should not refetch data. The following code ensures that.

  getSnapshotBeforeUpdate(prevProps) {
    this.prevState = prevProps.category;
    return null;
  }

  componentDidUpdate() {
    if (this.prevState === this.props.category) {
      return;
    }
    this.getProducts();
  }
}

export default PLP;
