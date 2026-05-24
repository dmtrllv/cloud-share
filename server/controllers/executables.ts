import { Controller, data, get, js } from "../framework/index.js";

const TEST_APP_CODE = `

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/index.tsx
import { Executable, useWindow } from "cloud-share";
import React, { useState } from "react";
var TestApp = class extends Executable {
  render() {
    const window = useWindow();
    const [state, setState] = useState(1);
    const dec = () => setState(state - 1);
    const inc = () => setState(state + 1);
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { onClick: dec }, "dec"), /* @__PURE__ */ React.createElement("h3", null, "count: ", state), /* @__PURE__ */ React.createElement("button", { onClick: inc }, "inc"), /* @__PURE__ */ React.createElement("button", { onClick: window.close }, "Close App"));
  }
};
TestApp = __decorateClass([
  Executable.register("Test App 2")
], TestApp);
export {
  TestApp as default
};




`;

export class Executables extends Controller {
	@get("/executables/runtime")
	public runtime(@data(String) module: string) {
		console.log("got module", module);
		return js("export default new Proxy({}, { get: (_, p) => window[p] });");
	}

	@get("/executables/load")
	public async load(@data(String) _name: string) {
		return TEST_APP_CODE;
	}
}

const x = {
	test: 1,
	test2: 2,
};

export {
	x
};