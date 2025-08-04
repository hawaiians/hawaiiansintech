module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    // Essential runtime error prevention
    "no-undef": "error",
    "no-unused-vars": "off", // Using TypeScript version instead
    "@typescript-eslint/no-unused-vars": "error",

    // Basic code quality
    "prefer-const": "error",
    "no-var": "error",

    // React essentials
    "react-hooks/rules-of-hooks": "error",
  },
};
