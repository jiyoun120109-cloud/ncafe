"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetPlatformSettingError = exports.GetPlatformPartnerScheduleError = exports.GetPlatformPartnerFilterOptionsError = exports.GetPlatformDiscountSharePolicyScheduleError = exports.GetPlatformDiscountSharePolicyFilterOptionsError = exports.GetPlatformContractScheduleError = exports.GetPlatformAdditionalFeePolicyScheduleError = exports.CancelPlatformPartnerScheduleError = exports.CancelPlatformDiscountSharePolicyScheduleError = exports.CancelPlatformContractScheduleError = exports.CancelPlatformAdditionalFeePolicyScheduleError = void 0;
exports.PlatformClient = PlatformClient;
exports.UpdatePlatformSettingError = exports.SchedulePlatformPartnersError = exports.SchedulePartnerError = exports.ScheduleDiscountSharePolicyError = exports.ScheduleContractError = exports.ScheduleAdditionalFeePolicyError = exports.ReschedulePartnerError = exports.RescheduleDiscountSharePolicyError = exports.RescheduleContractError = exports.RescheduleAdditionalFeePolicyError = void 0;
var _PlatformError = require("./PlatformError.cjs");
var _client = require("../../client.cjs");
var _client2 = require("./company/client.cjs");
var _client3 = require("./accountTransfer/client.cjs");
var _client4 = require("./policy/client.cjs");
var _client5 = require("./account/client.cjs");
var _client6 = require("./bulkAccountTransfer/client.cjs");
var _client7 = require("./bulkPayout/client.cjs");
var _client8 = require("./partnerSettlement/client.cjs");
var _client9 = require("./partner/client.cjs");
var _client10 = require("./payout/client.cjs");
var _client11 = require("./transfer/client.cjs");
function PlatformClient(init) {
  const baseUrl = init.baseUrl ?? "https://api.portone.io";
  const secret = init.secret;
  return {
    getPlatformAdditionalFeePolicySchedule: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/additional-fee-policies/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformAdditionalFeePolicyScheduleError(await response.json());
      }
      return response.json();
    },
    rescheduleAdditionalFeePolicy: async options => {
      const {
        id,
        test,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/additional-fee-policies/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "PUT",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new RescheduleAdditionalFeePolicyError(await response.json());
      }
      return response.json();
    },
    scheduleAdditionalFeePolicy: async options => {
      const {
        id,
        test,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/additional-fee-policies/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new ScheduleAdditionalFeePolicyError(await response.json());
      }
      return response.json();
    },
    cancelPlatformAdditionalFeePolicySchedule: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/additional-fee-policies/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "DELETE",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new CancelPlatformAdditionalFeePolicyScheduleError(await response.json());
      }
      return response.json();
    },
    getPlatformContractSchedule: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/contracts/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformContractScheduleError(await response.json());
      }
      return response.json();
    },
    rescheduleContract: async options => {
      const {
        id,
        test,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/contracts/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "PUT",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new RescheduleContractError(await response.json());
      }
      return response.json();
    },
    scheduleContract: async options => {
      const {
        id,
        test,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/contracts/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new ScheduleContractError(await response.json());
      }
      return response.json();
    },
    cancelPlatformContractSchedule: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/contracts/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "DELETE",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new CancelPlatformContractScheduleError(await response.json());
      }
      return response.json();
    },
    getPlatformDiscountSharePolicySchedule: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/discount-share-policies/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformDiscountSharePolicyScheduleError(await response.json());
      }
      return response.json();
    },
    rescheduleDiscountSharePolicy: async options => {
      const {
        id,
        test,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/discount-share-policies/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "PUT",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new RescheduleDiscountSharePolicyError(await response.json());
      }
      return response.json();
    },
    scheduleDiscountSharePolicy: async options => {
      const {
        id,
        test,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/discount-share-policies/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new ScheduleDiscountSharePolicyError(await response.json());
      }
      return response.json();
    },
    cancelPlatformDiscountSharePolicySchedule: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/discount-share-policies/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "DELETE",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new CancelPlatformDiscountSharePolicyScheduleError(await response.json());
      }
      return response.json();
    },
    getPlatformDiscountSharePolicyFilterOptions: async options => {
      const test = options?.test;
      const isArchived = options?.isArchived;
      const query = [["test", test], ["isArchived", isArchived]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/discount-share-policy-filter-options?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformDiscountSharePolicyFilterOptionsError(await response.json());
      }
      return response.json();
    },
    getPlatformPartnerFilterOptions: async options => {
      const test = options?.test;
      const isArchived = options?.isArchived;
      const query = [["test", test], ["isArchived", isArchived]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partner-filter-options?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformPartnerFilterOptionsError(await response.json());
      }
      return response.json();
    },
    schedulePlatformPartners: async options => {
      const {
        test,
        filter,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        filter,
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/schedule?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new SchedulePlatformPartnersError(await response.json());
      }
      return response.json();
    },
    getPlatformPartnerSchedule: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformPartnerScheduleError(await response.json());
      }
      return response.json();
    },
    reschedulePartner: async options => {
      const {
        id,
        test,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "PUT",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new ReschedulePartnerError(await response.json());
      }
      return response.json();
    },
    schedulePartner: async options => {
      const {
        id,
        test,
        update,
        appliedAt
      } = options;
      const requestBody = JSON.stringify({
        update,
        appliedAt
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new SchedulePartnerError(await response.json());
      }
      return response.json();
    },
    cancelPlatformPartnerSchedule: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/${encodeURIComponent(id)}/schedule?${query}`, baseUrl), {
        method: "DELETE",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new CancelPlatformPartnerScheduleError(await response.json());
      }
      return response.json();
    },
    getPlatformSetting: async options => {
      const test = options?.test;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/setting?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformSettingError(await response.json());
      }
      return response.json();
    },
    updatePlatformSetting: async options => {
      const test = options?.test;
      const defaultWithdrawalMemo = options?.defaultWithdrawalMemo;
      const defaultDepositMemo = options?.defaultDepositMemo;
      const supportsMultipleOrderTransfersPerPartner = options?.supportsMultipleOrderTransfersPerPartner;
      const adjustSettlementDateAfterHolidayIfEarlier = options?.adjustSettlementDateAfterHolidayIfEarlier;
      const deductWht = options?.deductWht;
      const settlementAmountType = options?.settlementAmountType;
      const requestBody = JSON.stringify({
        defaultWithdrawalMemo,
        defaultDepositMemo,
        supportsMultipleOrderTransfersPerPartner,
        adjustSettlementDateAfterHolidayIfEarlier,
        deductWht,
        settlementAmountType
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/setting?${query}`, baseUrl), {
        method: "PATCH",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new UpdatePlatformSettingError(await response.json());
      }
      return response.json();
    },
    company: (0, _client2.CompanyClient)(init),
    accountTransfer: (0, _client3.AccountTransferClient)(init),
    policy: (0, _client4.PolicyClient)(init),
    account: (0, _client5.AccountClient)(init),
    bulkAccountTransfer: (0, _client6.BulkAccountTransferClient)(init),
    bulkPayout: (0, _client7.BulkPayoutClient)(init),
    partnerSettlement: (0, _client8.PartnerSettlementClient)(init),
    partner: (0, _client9.PartnerClient)(init),
    payout: (0, _client10.PayoutClient)(init),
    transfer: (0, _client11.TransferClient)(init)
  };
}
class GetPlatformAdditionalFeePolicyScheduleError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformAdditionalFeePolicyScheduleError.prototype);
    this.name = "GetPlatformAdditionalFeePolicyScheduleError";
  }
}
exports.GetPlatformAdditionalFeePolicyScheduleError = GetPlatformAdditionalFeePolicyScheduleError;
class RescheduleAdditionalFeePolicyError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, RescheduleAdditionalFeePolicyError.prototype);
    this.name = "RescheduleAdditionalFeePolicyError";
  }
}
exports.RescheduleAdditionalFeePolicyError = RescheduleAdditionalFeePolicyError;
class ScheduleAdditionalFeePolicyError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, ScheduleAdditionalFeePolicyError.prototype);
    this.name = "ScheduleAdditionalFeePolicyError";
  }
}
exports.ScheduleAdditionalFeePolicyError = ScheduleAdditionalFeePolicyError;
class CancelPlatformAdditionalFeePolicyScheduleError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, CancelPlatformAdditionalFeePolicyScheduleError.prototype);
    this.name = "CancelPlatformAdditionalFeePolicyScheduleError";
  }
}
exports.CancelPlatformAdditionalFeePolicyScheduleError = CancelPlatformAdditionalFeePolicyScheduleError;
class GetPlatformContractScheduleError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformContractScheduleError.prototype);
    this.name = "GetPlatformContractScheduleError";
  }
}
exports.GetPlatformContractScheduleError = GetPlatformContractScheduleError;
class RescheduleContractError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, RescheduleContractError.prototype);
    this.name = "RescheduleContractError";
  }
}
exports.RescheduleContractError = RescheduleContractError;
class ScheduleContractError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, ScheduleContractError.prototype);
    this.name = "ScheduleContractError";
  }
}
exports.ScheduleContractError = ScheduleContractError;
class CancelPlatformContractScheduleError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, CancelPlatformContractScheduleError.prototype);
    this.name = "CancelPlatformContractScheduleError";
  }
}
exports.CancelPlatformContractScheduleError = CancelPlatformContractScheduleError;
class GetPlatformDiscountSharePolicyScheduleError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformDiscountSharePolicyScheduleError.prototype);
    this.name = "GetPlatformDiscountSharePolicyScheduleError";
  }
}
exports.GetPlatformDiscountSharePolicyScheduleError = GetPlatformDiscountSharePolicyScheduleError;
class RescheduleDiscountSharePolicyError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, RescheduleDiscountSharePolicyError.prototype);
    this.name = "RescheduleDiscountSharePolicyError";
  }
}
exports.RescheduleDiscountSharePolicyError = RescheduleDiscountSharePolicyError;
class ScheduleDiscountSharePolicyError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, ScheduleDiscountSharePolicyError.prototype);
    this.name = "ScheduleDiscountSharePolicyError";
  }
}
exports.ScheduleDiscountSharePolicyError = ScheduleDiscountSharePolicyError;
class CancelPlatformDiscountSharePolicyScheduleError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, CancelPlatformDiscountSharePolicyScheduleError.prototype);
    this.name = "CancelPlatformDiscountSharePolicyScheduleError";
  }
}
exports.CancelPlatformDiscountSharePolicyScheduleError = CancelPlatformDiscountSharePolicyScheduleError;
class GetPlatformDiscountSharePolicyFilterOptionsError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformDiscountSharePolicyFilterOptionsError.prototype);
    this.name = "GetPlatformDiscountSharePolicyFilterOptionsError";
  }
}
exports.GetPlatformDiscountSharePolicyFilterOptionsError = GetPlatformDiscountSharePolicyFilterOptionsError;
class GetPlatformPartnerFilterOptionsError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformPartnerFilterOptionsError.prototype);
    this.name = "GetPlatformPartnerFilterOptionsError";
  }
}
exports.GetPlatformPartnerFilterOptionsError = GetPlatformPartnerFilterOptionsError;
class SchedulePlatformPartnersError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, SchedulePlatformPartnersError.prototype);
    this.name = "SchedulePlatformPartnersError";
  }
}
exports.SchedulePlatformPartnersError = SchedulePlatformPartnersError;
class GetPlatformPartnerScheduleError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformPartnerScheduleError.prototype);
    this.name = "GetPlatformPartnerScheduleError";
  }
}
exports.GetPlatformPartnerScheduleError = GetPlatformPartnerScheduleError;
class ReschedulePartnerError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, ReschedulePartnerError.prototype);
    this.name = "ReschedulePartnerError";
  }
}
exports.ReschedulePartnerError = ReschedulePartnerError;
class SchedulePartnerError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, SchedulePartnerError.prototype);
    this.name = "SchedulePartnerError";
  }
}
exports.SchedulePartnerError = SchedulePartnerError;
class CancelPlatformPartnerScheduleError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, CancelPlatformPartnerScheduleError.prototype);
    this.name = "CancelPlatformPartnerScheduleError";
  }
}
exports.CancelPlatformPartnerScheduleError = CancelPlatformPartnerScheduleError;
class GetPlatformSettingError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformSettingError.prototype);
    this.name = "GetPlatformSettingError";
  }
}
exports.GetPlatformSettingError = GetPlatformSettingError;
class UpdatePlatformSettingError extends _PlatformError.PlatformError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, UpdatePlatformSettingError.prototype);
    this.name = "UpdatePlatformSettingError";
  }
}
exports.UpdatePlatformSettingError = UpdatePlatformSettingError;