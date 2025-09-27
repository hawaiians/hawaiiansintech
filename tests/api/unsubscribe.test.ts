import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/unsubscribe";
import * as auth from "@/lib/api-helpers/auth";
import {
  InvalidApiMethodError,
  MissingHeaderError,
  MissingBodyParamError,
  MissingQueryParamError,
  InvalidBodyParamTypeError,
} from "@/lib/api-helpers/errors";
import { testInvalidMethod, testUnexpectedError } from "./api-test-utils";

jest.mock("@/lib/api-helpers/auth", () => ({
  verifyAuthHeader: jest.fn(),
  verifyAdminToken: jest.fn(),
}));

jest.mock("@/lib/firebase-helpers/initializeAdmin", () => ({
  initializeAdmin: jest.fn(),
}));

jest.mock("@/lib/api-helpers/format", () => ({
  checkMethods: jest.fn((method, allowedMethods) => {
    if (!allowedMethods.includes(method)) {
      throw new InvalidApiMethodError(`Method ${method} not allowed`);
    }
  }),
  checkQueryParams: jest.fn((req, params) => {
    if (req.query.uid === undefined) {
      throw new MissingQueryParamError("uid");
    }
    if (Array.isArray(req.query.uid)) {
      throw new InvalidBodyParamTypeError("id", "string");
    }
  }),
  checkBodyParams: jest.fn((req, params) => {
    if (!req.body.uid) {
      throw new MissingBodyParamError("uid");
    }
    if (!req.body.unsubKey) {
      throw new MissingBodyParamError("unsubKey");
    }
  }),
}));

jest.mock("firebase-admin", () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
      })),
    })),
    FieldValue: {
      serverTimestamp: jest.fn(() => "mock-timestamp"),
    },
  })),
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
    applicationDefault: jest.fn(),
  },
}));

jest.mock("crypto", () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => "abc123"),
  })),
}));

describe("/api/unsubscribe", () => {
  const mockFirestore = require("firebase-admin").firestore;
  const mockInitializeAdmin =
    require("@/lib/firebase-helpers/initializeAdmin").initializeAdmin;
  const {
    checkQueryParams,
    checkBodyParams,
  } = require("@/lib/api-helpers/format");

  beforeEach(() => {
    jest.clearAllMocks();
    (checkQueryParams as jest.Mock).mockImplementation((req, params) => {
      if (req.query.uid === undefined) {
        throw new MissingQueryParamError("uid");
      }
      if (Array.isArray(req.query.uid)) {
        throw new InvalidBodyParamTypeError("id", "string");
      }
    });
    (checkBodyParams as jest.Mock).mockImplementation((req, params) => {
      if (!req.body.uid) {
        throw new MissingBodyParamError("uid");
      }
      if (!req.body.unsubKey) {
        throw new MissingBodyParamError("unsubKey");
      }
    });
  });

  describe("GET success cases", () => {
    it("should return existing unsubscribe key for valid user", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { uid: "user123" },
        headers: { authorization: "Bearer admin-token" },
      });

      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("admin-token");
      (auth.verifyAdminToken as jest.Mock).mockResolvedValue(true);
      (checkQueryParams as jest.Mock).mockImplementation(() => {});

      const mockDoc = {
        exists: true,
        get: jest.fn(() => "existing-key"),
      };
      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
        update: jest.fn(),
      };
      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDocRef),
      };
      mockFirestore.mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection),
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      // The API uses res.send() not res.json(), so parse differently
      const responseData = res._getData();
      expect(responseData).toEqual({
        unsubKey: "existing-key",
      });
      expect(mockInitializeAdmin).toHaveBeenCalled();
    });

    it("should handle array uid query parameter error", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { uid: ["user1", "user2"] }, // Array instead of string
        headers: { authorization: "Bearer admin-token" },
      });

      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("admin-token");
      (auth.verifyAdminToken as jest.Mock).mockResolvedValue(true);
      // checkQueryParams will throw for array parameter
      (checkQueryParams as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid type for body parameter id, expected string");
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Invalid type for body parameter id, expected string",
      });
    });
  });

  describe("PATCH success cases", () => {
    it("should handle user already unsubscribed", async () => {
      const { req, res } = createMocks({
        method: "PATCH",
        body: { uid: "user123", unsubKey: "valid-key" },
      });

      (checkBodyParams as jest.Mock).mockImplementation(() => {});

      // Mock Firebase operations - user already unsubscribed
      const mockSecureDoc = {
        exists: true,
        get: jest
          .fn()
          .mockReturnValueOnce("valid-key")
          .mockReturnValueOnce(true), // unsubscribed status = true
      };
      const mockSecureDocRef = {
        get: jest.fn().mockResolvedValue(mockSecureDoc),
      };

      mockFirestore.mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue(mockSecureDocRef),
        }),
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData()); // PATCH uses res.json()
      expect(responseData).toEqual({
        message: "Successfully unsubscribed member with uid user123",
      });
    });
  });

  describe("Error scenarios", () => {
    it("should handle non-existent user for GET", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { uid: "nonexistent" },
        headers: { authorization: "Bearer admin-token" },
      });

      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("admin-token");
      (auth.verifyAdminToken as jest.Mock).mockResolvedValue(true);
      (checkQueryParams as jest.Mock).mockImplementation(() => {});

      // Mock Firebase operations - user doesn't exist
      const mockDoc = {
        exists: false,
      };
      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
      };
      mockFirestore.mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue(mockDocRef),
        }),
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Member with uid nonexistent does not exist",
      });
    });

    it("should handle invalid unsubscribe key for PATCH", async () => {
      const { req, res } = createMocks({
        method: "PATCH",
        body: { uid: "user123", unsubKey: "invalid-key" },
      });

      (checkBodyParams as jest.Mock).mockImplementation(() => {});

      const mockSecureDoc = {
        exists: true,
        get: jest.fn().mockReturnValue("valid-key"), // Different from provided key
      };
      const mockSecureDocRef = {
        get: jest.fn().mockResolvedValue(mockSecureDoc),
      };

      mockFirestore.mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue(mockSecureDocRef),
        }),
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Unauthorized key",
      });
    });

    it("should handle member not found during unsubscribe", async () => {
      const { req, res } = createMocks({
        method: "PATCH",
        body: { uid: "user123", unsubKey: "valid-key" },
      });

      (checkBodyParams as jest.Mock).mockImplementation(() => {});

      // Mock Firebase operations - secure data exists but member doesn't
      const mockSecureDoc = {
        exists: true,
        get: jest
          .fn()
          .mockReturnValueOnce("valid-key") // unsubscribe_key matches
          .mockReturnValueOnce(false),
      };
      const mockMemberDoc = {
        exists: false, // Member doesn't exist
      };
      const mockSecureDocRef = {
        get: jest.fn().mockResolvedValue(mockSecureDoc),
      };
      const mockMemberDocRef = {
        get: jest.fn().mockResolvedValue(mockMemberDoc),
      };

      const mockCollection = jest
        .fn()
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue(mockSecureDocRef),
        })
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue(mockMemberDocRef),
        });

      mockFirestore.mockReturnValue({
        collection: mockCollection,
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Member with uid user123 does not exist",
      });
    });
  });

  describe("Error handling tests", () => {
    it("should handle missing authorization header for GET", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { uid: "user123" },
        headers: {},
      });

      (auth.verifyAuthHeader as jest.Mock).mockRejectedValue(
        new MissingHeaderError(),
      );

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Authorization header missing",
      });
    });

    it("should handle invalid admin token", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { uid: "user123" },
        headers: { authorization: "Bearer invalid-token" },
      });

      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("invalid-token");
      (auth.verifyAdminToken as jest.Mock).mockRejectedValue(
        new Error("Invalid admin token"),
      );

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Invalid admin token",
      });
    });

    it("should handle missing uid query parameter", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {},
        headers: { authorization: "Bearer admin-token" },
      });

      // Mock auth to pass so we reach the query param validation
      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("admin-token");
      (auth.verifyAdminToken as jest.Mock).mockResolvedValue(true);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Query parameter uid missing",
      });
    });

    it("should handle missing body parameters for PATCH", async () => {
      const { req, res } = createMocks({
        method: "PATCH",
        body: {},
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Body parameter uid missing",
      });
    });

    it("should handle missing unsubKey for PATCH", async () => {
      const { req, res } = createMocks({
        method: "PATCH",
        body: { uid: "user123" },
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Body parameter unsubKey missing",
      });
    });
  });

  it(
    "should return 405 for POST requests",
    testInvalidMethod(handler, "POST", "Method POST not allowed"),
  );

  it(
    "should return 405 for PUT requests",
    testInvalidMethod(handler, "PUT", "Method PUT not allowed"),
  );

  it(
    "should return 405 for DELETE requests",
    testInvalidMethod(handler, "DELETE", "Method DELETE not allowed"),
  );

  it(
    "should handle unexpected errors",
    testUnexpectedError(
      handler,
      "GET",
      () => {
        (auth.verifyAuthHeader as jest.Mock).mockRejectedValue(
          new Error("Unexpected error"),
        );
      },
      { authorization: "Bearer token" },
      {},
    ),
  );
});
