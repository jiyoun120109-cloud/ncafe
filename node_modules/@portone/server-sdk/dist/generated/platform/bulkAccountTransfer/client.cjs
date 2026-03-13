"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BulkAccountTransferClient = BulkAccountTransferClient;
exports.GetPlatformBulkAccountTransfersError = void 0;
var _BulkAccountTransferError = require("./BulkAccountTransferError.cjs");
var _client = require("../../../client.cjs");
function BulkAccountTransferClient(init) {
  const baseUrl = init.baseUrl ?? "https://api.portone.io";
  const secret = init.secret;
  return {
    getPlatformBulkAccountTransfers: async options => {
      const test = options?.test;
      const isForTest = options?.isForTest;
      const page = options?.page;
      const filter = options?.filter;
      const requestBody = JSON.stringify({
        isForTest,
        page,
        filter
      });
      const query = [["test", test], ["requestBody", requestBody]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/bulk-account-transfers?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformBulkAccountTransfersError(await response.json());
      }
      return response.json();
    }
  };
}
class GetPlatformBulkAccountTransfersError extends _BulkAccountTransferError.BulkAccountTransferError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformBulkAccountTransfersError.prototype);
    this.name = "GetPlatformBulkAccountTransfersError";
  }
}
exports.GetPlatformBulkAccountTransfersError = GetPlatformBulkAccountTransfersError;