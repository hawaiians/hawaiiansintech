import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/is-admin";
import * as auth from "@/lib/api-helpers/auth";
import {
  MissingHeaderError,
  TokenVerificationError,
  InvalidApiMethodError,
} from "@/lib/api-helpers/errors";
import { testInvalidToken, testUnexpectedError } from "./api-test-utils";

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

describe("/api/is-admin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return isAdmin: true for valid admin token", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
    });

    (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("admin-token");
    (auth.verifyAdminToken as jest.Mock).mockResolvedValue(true);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual({ isAdmin: true });
  });

  it("should return isAdmin: false for valid non-admin token", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: { authorization: "Bearer user-token" },
    });

    (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("user-token");
    (auth.verifyAdminToken as jest.Mock).mockResolvedValue(false);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual({ isAdmin: false });
  });

  // Common API tests using utilities
  it("should handle missing authorization header", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {},
    });

    (auth.verifyAuthHeader as jest.Mock).mockRejectedValue(
      new MissingHeaderError(),
    );

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Authorization header missing",
    });
  });

  it(
    "should handle token verification errors",
    testInvalidToken(handler, "GET", () => {
      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("invalid-token");
      (auth.verifyAdminToken as jest.Mock).mockRejectedValue(
        new TokenVerificationError("Invalid token"),
      );
    }),
  );

  it("should return 405 for unsupported HTTP methods", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: { authorization: "Bearer token" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Method POST not allowed",
    });
  });

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
    ),
  );
});
