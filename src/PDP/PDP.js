import React, { Component } from "react";
import { gql } from "@apollo/client";
import DOMPurify from "dompurify";
import Spinner from "../Spinner/Spinner";

import classes from "./PDP.module.css";

export class PDP extends Component {
  // Using React.createRef will allow us to set the product description with the appropriate HTML tags. The rest
  // of the code is in componentDidMount.

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  state = { product: {} };

  // set displayed image
  setImage = (e) => {
    this.setState({ selectedImage: e.target.dataset.src });
  };

  //apply style to selected attribute

  selectedAttributeStyle = (value, attribute) => {
    const index =
      this.state.product.attributesObject.selectedAttributes.findIndex(
        (item) => {
          return item.attribute === attribute.id;
        }
      );

    if (
      this.state.product.attributesObject.selectedAttributes[index]
        .selectedValue === value
    ) {
      return true;
    }
    return false;
  };
  // select attributes

  selectAttribute = (e) => {
    const index =
      this.state.product.attributesObject.selectedAttributes.findIndex(
        (item) => {
          return item.attribute === e.target.dataset.attributeId;
        }
      );

    this.setState({
      product: {
        ...this.state.product,
        attributesObject: {
          selectedAttributes: [
            ...this.state.product.attributesObject.selectedAttributes.slice(
              0,
              index
            ),
            {
              ...this.state.product.attributesObject.selectedAttributes[index],
              selectedValue: e.target.dataset.id,
            },
            ...this.state.product.attributesObject.selectedAttributes.slice(
              index + 1
            ),
          ],
        },
      },
    });
  };

  addToCart = () => {
    // if the product is already in cart and with same attributes, increase amount in cart

    const similarProductInCartIndex = this.props.cart.products.findIndex(
      (cartProduct) => {
        return (
          cartProduct.id === this.state.product.id &&
          this.state.product.attributesObject.selectedAttributes.every(
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
      return this.props.updateGlobalState({
        cart: {
          ...this.props.cart,
          products: [
            ...this.props.cart.products.slice(0, similarProductInCartIndex),
            {
              ...this.props.cart.products[similarProductInCartIndex],
              amount:
                this.props.cart.products[similarProductInCartIndex].amount + 1,
            },
            ...this.props.cart.products.slice(similarProductInCartIndex + 1),
          ],
        },
      });
    }

    //if not, add to cart
    this.props.updateGlobalState({
      cart: {
        ...this.props.cart,
        products: [
          ...this.props.cart.products,
          { ...this.state.product, amount: 1 },
        ],
      },
    });
  };

  // the following functions check whether the product is already in the cart or if it's not in stock.
  // if already in the cart, return a button to remove it.
  // if not in stock, return a button that doesn't allow to add to cart.

  removeFromCartHandler = () => {
    const index = this.props.cart.products.findIndex((product) => {
      return product.id === this.state.product.id;
    });

    this.props.updateGlobalState({
      cart: {
        ...this.props.cart,
        products: [
          ...this.props.cart.products.slice(0, index),
          ...this.props.cart.products.slice(index + 1),
        ],
      },
    });
  };

  checkIfInStock = () => {
    if (!this.state.product.inStock) {
      return <p className={classes["not-in-stock-text"]}>OUT OF STOCK</p>;
    }
    return (
      <button className={classes["add-btn"]} onClick={this.addToCart}>
        ADD TO CART
      </button>
    );
  };

  render() {
    if (!this.state.product.name) {
      return <Spinner />;
    }

    return (
      <main className={classes.main}>
        <div className={classes["gallery-wrapper"]}>
          <div className={classes["all-images-wrapper"]}>
            {this.state.product.gallery.map((image) => {
              return (
                <img
                  className={classes.image}
                  src={image}
                  alt=""
                  key={image}
                  data-src={image}
                  onClick={(e) => {
                    this.setImage(e);
                  }}
                />
              );
            })}
          </div>
          <img
            src={this.state.selectedImage}
            className={classes["selected-image"]}
            alt=""
          />
        </div>
        <div className={classes["details-wrapper"]}>
          <h1 className={classes.brand}>{this.state.product.brand}</h1>

          <h2 className={classes.name}>{this.state.product.name}</h2>

          {this.state.product.attributes.map((attribute) => {
            if (attribute.name === "Color") {
              return (
                <React.Fragment
                  key={`${attribute.id} ${this.state.product.id}`}
                >
                  <h3 className={classes["attribute-name"]}>
                    {attribute.name}:
                  </h3>
                  <div className={classes["attribute-values-wrapper"]}>
                    {attribute.items.map((item) => {
                      return (
                        <div
                          style={{ background: item.value }}
                          className={
                            this.selectedAttributeStyle(item.id, attribute)
                              ? classes["selected-color-btn"]
                              : classes["color-btn"]
                          }
                          key={`${attribute.id} ${this.state.product.id} ${item.id}`}
                          data-id={item.id}
                          data-attribute-id={attribute.id}
                          onClick={(e) => {
                            this.selectAttribute(e);
                          }}
                        ></div>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={`${attribute.id} ${this.state.product.id}`}>
                <h3 className={classes["attribute-name"]}>{attribute.name}:</h3>
                <div className={classes["attribute-values-wrapper"]}>
                  {attribute.items.map((item) => {
                    return (
                      <button
                        key={`${attribute.id} ${this.state.product.id} ${item.id}`}
                        className={
                          this.selectedAttributeStyle(item.id, attribute)
                            ? classes["selected-value-btn"]
                            : classes["value-btn"]
                        }
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

          <h3 className={classes["price-heading"]}>PRICE:</h3>
          <p className={classes.price}>
            {this.props.currencySymbol}{" "}
            {
              this.state.product.prices.filter((price) => {
                return price.currency.label === this.props.currency;
              })[0].amount
            }
          </p>
          {this.checkIfInStock()}
          <div ref={this.myRef} className={classes["desc-div"]}></div>
        </div>
      </main>
    );
  }

  //Fetch product details

  componentDidMount() {
    const getProduct = async () => {
      // Get product id from page link

      const id = window.location.pathname.slice(9);

      const res = await this.props.client.query({
        query: gql`query {product(id: "${id}") {id,name,inStock,gallery,description,category,attributes{id,name,type,items{displayValue,value,id}},prices{currency{label,symbol},amount},brand}}`,
      });

      let attributesObject = {};

      res.data.product.attributes.forEach((attribute) => {
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
        product: {
          ...res.data.product,
          attributesObject: { ...attributesObject },
        },
        selectedImage: res.data.product.gallery[0],
      });

      //Here, we use setTimeOut to ensure the state has been updated, and then we set the description.

      setTimeout(() => {
        const clean = DOMPurify.sanitize(this.state.product.description);
        this.myRef.current.innerHTML = clean;
      }, 0);
    };
    getProduct();
  }
}

export default PDP;
