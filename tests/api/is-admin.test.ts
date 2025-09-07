import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/is-admin";
import * as auth from "@/lib/api-helpers/auth";
import {
  MissingHeaderError,
  MissingTokenError,
  TokenVerificationError,
  InvalidApiMethodError,
} from "@/lib/api-helpers/errors";

// Mock the auth module
jest.mock("@/lib/api-helpers/auth", () => ({
  verifyAuthHeader: jest.fn(),
  verifyAdminToken: jest.fn(),
}));

// Mock the format module
jest.mock("@/lib/api-helpers/format", () => ({
  checkMethods: jest.fn((method, allowedMethods) => {
    if (!allowedMethods.includes(method)) {
      throw new InvalidApiMethodError(`Method ${method} not allowed`);
    }
  }),
}));

// Mock Firebase helpers
jest.mock("@/lib/firebase-helpers/initializeAdmin", () => ({
  initializeAdmin: jest.fn(),
}));

describe("/api/is-admin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET requests", () => {
    it("should return isAdmin: true for valid admin token", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-admin-token",
        },
      });

      // Mock successful auth verification
      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue(
        "valid-admin-token",
      );
      (auth.verifyAdminToken as jest.Mock).mockResolvedValue(true);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual({ isAdmin: true });
      expect(auth.verifyAuthHeader).toHaveBeenCalledWith(req);
      expect(auth.verifyAdminToken).toHaveBeenCalledWith("valid-admin-token");
    });

    it("should return isAdmin: false for valid non-admin token", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-user-token",
        },
      });

      // Mock successful auth verification but not admin
      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue(
        "valid-user-token",
      );
      (auth.verifyAdminToken as jest.Mock).mockResolvedValue(false);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual({ isAdmin: false });
      expect(auth.verifyAuthHeader).toHaveBeenCalledWith(req);
      expect(auth.verifyAdminToken).toHaveBeenCalledWith("valid-user-token");
    });

    it("should return 401 when authorization header is missing", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {},
      });

      // Mock missing header error
      (auth.verifyAuthHeader as jest.Mock).mockRejectedValue(
        new MissingHeaderError(),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Authorization header missing",
      });
      expect(auth.verifyAuthHeader).toHaveBeenCalledWith(req);
      expect(auth.verifyAdminToken).not.toHaveBeenCalled();
    });

    it("should return 401 when token is missing from header", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "Bearer ",
        },
      });

      // Mock missing token error
      (auth.verifyAuthHeader as jest.Mock).mockRejectedValue(
        new MissingTokenError(),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Authorization token missing in header",
      });
      expect(auth.verifyAuthHeader).toHaveBeenCalledWith(req);
      expect(auth.verifyAdminToken).not.toHaveBeenCalled();
    });

    it("should return 401 when token verification fails", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      // Mock successful header extraction but failed token verification
      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("invalid-token");
      (auth.verifyAdminToken as jest.Mock).mockRejectedValue(
        new TokenVerificationError("Invalid authentication token"),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Invalid authentication token",
      });
      expect(auth.verifyAuthHeader).toHaveBeenCalledWith(req);
      expect(auth.verifyAdminToken).toHaveBeenCalledWith("invalid-token");
    });

    it("should return 401 when token is expired", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "Bearer expired-token",
        },
      });

      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("expired-token");
      (auth.verifyAdminToken as jest.Mock).mockRejectedValue(
        new TokenVerificationError("Authentication token has expired"),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Authentication token has expired",
      });
    });
  });

  describe("Method validation", () => {
    it("should return 405 for POST requests", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Method POST not allowed",
      });
      expect(auth.verifyAuthHeader).not.toHaveBeenCalled();
      expect(auth.verifyAdminToken).not.toHaveBeenCalled();
    });

    it("should return 405 for PUT requests", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Method PUT not allowed",
      });
    });

    it("should return 405 for DELETE requests", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Method DELETE not allowed",
      });
    });
  });

  describe("Error handling", () => {
    it("should handle unexpected errors gracefully", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      // Mock an unexpected error
      (auth.verifyAuthHeader as jest.Mock).mockRejectedValue(
        new Error("Unexpected error"),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Unexpected error",
      });
    });

    it("should handle Firebase connection errors", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("valid-token");
      (auth.verifyAdminToken as jest.Mock).mockRejectedValue(
        new Error("Firebase connection failed"),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Firebase connection failed",
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle malformed authorization header", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "InvalidFormat",
        },
      });

      (auth.verifyAuthHeader as jest.Mock).mockRejectedValue(
        new MissingTokenError(),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Authorization token missing in header",
      });
    });

    it("should handle empty string token", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          authorization: "Bearer ",
        },
      });

      (auth.verifyAuthHeader as jest.Mock).mockRejectedValue(
        new MissingTokenError(),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Authorization token missing in header",
      });
    });
  });
});
