import { createMocks } from "node-mocks-http";

/**
 * Generic API test utilities for DRY testing
 */

export interface ApiTestConfig {
  handler: any;
  allowedMethods: string[];
  forbiddenMethods?: string[];
  requiresAuth?: boolean;
  requiresBody?: boolean;
}

/**
 * Test helper for HTTP method validation
 */
export function testInvalidMethod(
  handler: any,
  method: string,
  expectedMessage?: string,
) {
  return async () => {
    const { req, res } = createMocks({ method: method as any });
    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(405);
    const response = JSON.parse(res._getData());
    if (expectedMessage) {
      expect(response.message).toBe(expectedMessage);
    } else {
      expect(response.message).toContain(`Method ${method} not allowed`);
    }
  };
}

/**
 * Test helper for missing authorization header
 */
export function testMissingAuthHeader(handler: any, method: string = "GET") {
  return async () => {
    const { req, res } = createMocks({
      method: method as any,
      headers: {},
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    const response = JSON.parse(res._getData());
    expect(response.message).toBe("Authorization header missing");
  };
}

/**
 * Test helper for invalid token scenarios
 */
export function testInvalidToken(
  handler: any,
  method: string = "GET",
  mockSetup?: () => void,
) {
  return async () => {
    const { req, res } = createMocks({
      method: method as any,
      headers: { authorization: "Bearer invalid-token" },
    });

    if (mockSetup) {
      mockSetup();
    }

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
    const response = JSON.parse(res._getData());
    expect(response.message).toMatch(/token|Invalid/i);
  };
}

/**
 * Test helper for missing body parameters
 */
export function testMissingBodyParam(
  handler: any,
  method: string = "POST",
  body: any = {},
  expectedParam?: string,
) {
  return async () => {
    const { req, res } = createMocks({
      method: method as any,
      body,
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    const response = JSON.parse(res._getData());
    if (expectedParam) {
      expect(response.message).toContain(expectedParam);
    } else {
      expect(response.message).toContain("missing");
    }
  };
}

/**
 * Test helper for unexpected errors
 */
export function testUnexpectedError(
  handler: any,
  method: string,
  mockSetup: () => void,
  headers?: any,
  body?: any,
) {
  return async () => {
    const { req, res } = createMocks({
      method: method as any,
      headers: headers || { authorization: "Bearer token" },
      body: body || {},
    });

    mockSetup();
    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(500);
    const response = JSON.parse(res._getData());
    expect(response.message).toBe("Unexpected error");
  };
}
