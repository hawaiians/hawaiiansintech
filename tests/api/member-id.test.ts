import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/member-id";
import * as auth from "@/lib/api-helpers/auth";
import * as emails from "@/lib/firebase-helpers/emails";
import {
  MissingHeaderError,
  TokenVerificationError,
  InvalidApiMethodError,
} from "@/lib/api-helpers/errors";
import {
  testMissingAuthHeader,
  testInvalidToken,
  testUnexpectedError,
} from "./api-test-utils";

// Mock dependencies
jest.mock("@/lib/api-helpers/auth", () => ({
  verifyAuthHeader: jest.fn(),
  verifyEmailAuthToken: jest.fn(),
}));

jest.mock("@/lib/firebase-helpers/emails", () => ({
  getEmails: jest.fn(),
}));

jest.mock("@/lib/api-helpers/format", () => ({
  checkMethods: jest.fn((method, allowedMethods) => {
    if (!allowedMethods.includes(method)) {
      throw new InvalidApiMethodError(`Method ${method} not allowed`);
    }
  }),
}));

describe("/api/member-id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return memberId for valid token", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: { authorization: "Bearer valid-token" },
    });

    (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("valid-token");
    (auth.verifyEmailAuthToken as jest.Mock).mockResolvedValue(
      "test@example.com",
    );
    (emails.getEmails as jest.Mock).mockResolvedValue([
      { id: "member-123", email: "test@example.com" },
      { id: "member-456", email: "other@example.com" },
    ]);

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual({
      memberId: "member-123",
    });
    expect(emails.getEmails).toHaveBeenCalledWith(true);
  });

  it("should handle case-insensitive email matching", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: { authorization: "Bearer valid-token" },
    });

    (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("valid-token");
    (auth.verifyEmailAuthToken as jest.Mock).mockResolvedValue(
      "TEST@EXAMPLE.COM",
    );
    (emails.getEmails as jest.Mock).mockResolvedValue([
      { id: "member-123", email: "test@example.com" },
    ]);

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual({
      memberId: "member-123",
    });
  });

  it("should return 404 for non-existent member", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: { authorization: "Bearer valid-token" },
    });

    (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("valid-token");
    (auth.verifyEmailAuthToken as jest.Mock).mockResolvedValue(
      "notfound@example.com",
    );
    (emails.getEmails as jest.Mock).mockResolvedValue([
      { id: "member-123", email: "test@example.com" },
    ]);

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Member with email notfound@example.com not found",
    });
  });

  // Common error handling tests using DRY utilities
  it("should handle missing authorization header", async () => {
    const { req, res } = createMocks({
      method: "GET",
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

  it(
    "should handle invalid token",
    testInvalidToken(handler, "GET", () => {
      (auth.verifyAuthHeader as jest.Mock).mockResolvedValue("invalid-token");
      (auth.verifyEmailAuthToken as jest.Mock).mockRejectedValue(
        new TokenVerificationError("Invalid token"),
      );
    }),
  );

  it("should return 405 for non-GET requests", async () => {
    const { req, res } = createMocks({
      method: "POST",
    });

    await handler(req as any, res as any);

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
      { authorization: "Bearer valid-token" },
    ),
  );
});
