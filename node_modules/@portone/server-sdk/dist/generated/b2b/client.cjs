"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.B2bClient = B2bClient;
var _client = require("./taxInvoice/client.cjs");
function B2bClient(init) {
  return {
    taxInvoice: (0, _client.TaxInvoiceClient)(init)
  };
}