module.exports = {
  async redirects() {
    return [
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/:path*"
            : "/backend/api/",
        permanent: true,
      },
      {
        source: "/join",
        destination: "/join/01-you",
        permanent: true,
      },
      {
        source: "/nominate",
        destination: "/join/01-you",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/WHpCrPqeqx",
        permanent: false,
      },
      {
        source: "/linkedin",
        destination:
          "https://www.linkedin.com/company/hawaiians-in-technology/",
        permanent: false,
      },
    ];
  },
};
