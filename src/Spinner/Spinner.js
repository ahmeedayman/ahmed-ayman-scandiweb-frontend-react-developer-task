import classes from "./Spinner.module.css";

import React, { Component } from "react";

export class Spinner extends Component {
  render() {
    return <div className={classes.spinner}></div>;
  }
}

export default Spinner;
