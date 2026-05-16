import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  async rewrites() {
    // BACKEND_INTERNAL_URL is set in Docker so server-side rewrites reach the
    // backend container via the Docker network (http://backend:8000).
    // NEXT_PUBLIC_API_URL is the browser-visible address (http://localhost:8000).
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
