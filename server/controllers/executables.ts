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

// src/app.tsx
import sdk from "cloud-share";
var TestApp = class extends sdk.Executable {
  render() {
    const window = sdk.useWindow();
    return /* @__PURE__ */ globalThis.React.createElement("div", { className: "test-app" }, "TestApp ", /* @__PURE__ */ globalThis.React.createElement("button", { onClick: window.close }, "close"));
  }
};
TestApp = __decorateClass([
  sdk.Executable.register("Test App")
], TestApp);

// src/index.ts
var index_default = TestApp;
export {
  index_default as default
};

`;

export class Executables extends Controller {
	@get("/executables/cloud-share-sdk")
	public sdk() {
		return js("export default new Proxy({}, { get: (_, p) => window[p] });");
	}

	@get("/executables/load")
	public async load(@data(String) _name: string) {
		return TEST_APP_CODE;
	}
}