import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Anonymised case studies — old branded slugs redirect to the new
      // anonymous ones so live/indexed links keep working without exposing
      // the brand names anywhere on the site itself.
      {
        source: "/projects/sonnel",
        destination: "/projects/sydney-pub-group",
        permanent: true,
      },
      {
        source: "/projects/crossroads-hotel",
        destination: "/projects/western-sydney-hotel",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
