"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetPlatformPartnersError = exports.GetPlatformPartnerError = exports.DisconnectPartnerMemberCompanyError = exports.DisconnectBulkPartnerMemberCompanyError = exports.CreatePlatformPartnersError = exports.CreatePlatformPartnerError = exports.ConnectPartnerMemberCompanyError = exports.ConnectBulkPartnerMemberCompanyError = exports.ArchivePlatformPartnerError = void 0;
exports.PartnerClient = PartnerClient;
exports.UpdatePlatformPartnerError = exports.RecoverPlatformPartnerError = void 0;
var _PartnerError = require("./PartnerError.cjs");
var _client = require("../../../client.cjs");
function PartnerClient(init) {
  const baseUrl = init.baseUrl ?? "https://api.portone.io";
  const secret = init.secret;
  return {
    createPlatformPartners: async options => {
      const {
        test,
        partners
      } = options;
      const requestBody = JSON.stringify({
        partners
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/batch?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new CreatePlatformPartnersError(await response.json());
      }
      return response.json();
    },
    connectPartnerMemberCompany: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/member-company-connect/${encodeURIComponent(id)}?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new ConnectPartnerMemberCompanyError(await response.json());
      }
      return response.json();
    },
    connectBulkPartnerMemberCompany: async options => {
      const test = options?.test;
      const filter = options?.filter;
      const requestBody = JSON.stringify({
        filter
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/member-company-connect?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new ConnectBulkPartnerMemberCompanyError(await response.json());
      }
      return response.json();
    },
    disconnectPartnerMemberCompany: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/member-company-disconnect/${encodeURIComponent(id)}?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new DisconnectPartnerMemberCompanyError(await response.json());
      }
      return response.json();
    },
    disconnectBulkPartnerMemberCompany: async options => {
      const test = options?.test;
      const filter = options?.filter;
      const requestBody = JSON.stringify({
        filter
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/member-company-disconnect?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new DisconnectBulkPartnerMemberCompanyError(await response.json());
      }
      return response.json();
    },
    archivePlatformPartner: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/${encodeURIComponent(id)}/archive?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new ArchivePlatformPartnerError(await response.json());
      }
      return response.json();
    },
    recoverPlatformPartner: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/${encodeURIComponent(id)}/recover?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new RecoverPlatformPartnerError(await response.json());
      }
      return response.json();
    },
    getPlatformPartner: async options => {
      const {
        id,
        test
      } = options;
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/${encodeURIComponent(id)}?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformPartnerError(await response.json());
      }
      return response.json();
    },
    updatePlatformPartner: async options => {
      const {
        id,
        test,
        name,
        contact,
        account,
        defaultContractId,
        memo,
        tags,
        type,
        userDefinedProperties
      } = options;
      const requestBody = JSON.stringify({
        name,
        contact,
        account,
        defaultContractId,
        memo,
        tags,
        type,
        userDefinedProperties
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners/${encodeURIComponent(id)}?${query}`, baseUrl), {
        method: "PATCH",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new UpdatePlatformPartnerError(await response.json());
      }
      return response.json();
    },
    getPlatformPartners: async options => {
      const test = options?.test;
      const page = options?.page;
      const filter = options?.filter;
      const requestBody = JSON.stringify({
        page,
        filter
      });
      const query = [["test", test], ["requestBody", requestBody]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners?${query}`, baseUrl), {
        method: "GET",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        }
      });
      if (!response.ok) {
        throw new GetPlatformPartnersError(await response.json());
      }
      return response.json();
    },
    createPlatformPartner: async options => {
      const {
        test,
        id,
        name,
        contact,
        account,
        defaultContractId,
        memo,
        tags,
        type,
        userDefinedProperties
      } = options;
      const requestBody = JSON.stringify({
        id,
        name,
        contact,
        account,
        defaultContractId,
        memo,
        tags,
        type,
        userDefinedProperties
      });
      const query = [["test", test]].flatMap(([key, value]) => value == null ? [] : `${key}=${encodeURIComponent(value)}`).join("&");
      const response = await fetch(new URL(`/platform/partners?${query}`, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "User-Agent": _client.USER_AGENT
        },
        body: requestBody
      });
      if (!response.ok) {
        throw new CreatePlatformPartnerError(await response.json());
      }
      return response.json();
    }
  };
}
class CreatePlatformPartnersError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, CreatePlatformPartnersError.prototype);
    this.name = "CreatePlatformPartnersError";
  }
}
exports.CreatePlatformPartnersError = CreatePlatformPartnersError;
class ConnectPartnerMemberCompanyError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, ConnectPartnerMemberCompanyError.prototype);
    this.name = "ConnectPartnerMemberCompanyError";
  }
}
exports.ConnectPartnerMemberCompanyError = ConnectPartnerMemberCompanyError;
class ConnectBulkPartnerMemberCompanyError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, ConnectBulkPartnerMemberCompanyError.prototype);
    this.name = "ConnectBulkPartnerMemberCompanyError";
  }
}
exports.ConnectBulkPartnerMemberCompanyError = ConnectBulkPartnerMemberCompanyError;
class DisconnectPartnerMemberCompanyError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, DisconnectPartnerMemberCompanyError.prototype);
    this.name = "DisconnectPartnerMemberCompanyError";
  }
}
exports.DisconnectPartnerMemberCompanyError = DisconnectPartnerMemberCompanyError;
class DisconnectBulkPartnerMemberCompanyError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, DisconnectBulkPartnerMemberCompanyError.prototype);
    this.name = "DisconnectBulkPartnerMemberCompanyError";
  }
}
exports.DisconnectBulkPartnerMemberCompanyError = DisconnectBulkPartnerMemberCompanyError;
class ArchivePlatformPartnerError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, ArchivePlatformPartnerError.prototype);
    this.name = "ArchivePlatformPartnerError";
  }
}
exports.ArchivePlatformPartnerError = ArchivePlatformPartnerError;
class RecoverPlatformPartnerError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, RecoverPlatformPartnerError.prototype);
    this.name = "RecoverPlatformPartnerError";
  }
}
exports.RecoverPlatformPartnerError = RecoverPlatformPartnerError;
class GetPlatformPartnerError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformPartnerError.prototype);
    this.name = "GetPlatformPartnerError";
  }
}
exports.GetPlatformPartnerError = GetPlatformPartnerError;
class UpdatePlatformPartnerError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, UpdatePlatformPartnerError.prototype);
    this.name = "UpdatePlatformPartnerError";
  }
}
exports.UpdatePlatformPartnerError = UpdatePlatformPartnerError;
class GetPlatformPartnersError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, GetPlatformPartnersError.prototype);
    this.name = "GetPlatformPartnersError";
  }
}
exports.GetPlatformPartnersError = GetPlatformPartnersError;
class CreatePlatformPartnerError extends _PartnerError.PartnerError {
  /** @ignore */
  constructor(data) {
    super(data);
    Object.setPrototypeOf(this, CreatePlatformPartnerError.prototype);
    this.name = "CreatePlatformPartnerError";
  }
}
exports.CreatePlatformPartnerError = CreatePlatformPartnerError;