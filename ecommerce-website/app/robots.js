export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/checkout",
          "/cart",
          "/profile",
          "/orders",
          "/payment-methods",
          "/api",
        ],
      },
    ],
    sitemap: "https://babiesnbaba.com/sitemap.xml",
  };
}
