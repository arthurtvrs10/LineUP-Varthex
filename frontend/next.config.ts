import type { NextConfig } from "next";

// Local: aponta pro backend em localhost. Em Docker Compose, sobrescrito
// para http://backend:8080 (nome do serviço, não "localhost").
const backendUrl = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/auth/:path*", destination: `${backendUrl}/auth/:path*` },
      { source: "/tenants", destination: `${backendUrl}/tenants` },
      { source: "/tenants/:path*", destination: `${backendUrl}/tenants/:path*` },
      { source: "/tenant", destination: `${backendUrl}/tenant` },
      { source: "/tenant/:path*", destination: `${backendUrl}/tenant/:path*` },
      { source: "/unit", destination: `${backendUrl}/unit` },
      { source: "/units/:path*", destination: `${backendUrl}/units/:path*` },
      { source: "/users", destination: `${backendUrl}/users` },
      { source: "/users/:path*", destination: `${backendUrl}/users/:path*` },
      { source: "/barbers", destination: `${backendUrl}/barbers` },
      { source: "/barbers/:path*", destination: `${backendUrl}/barbers/:path*` },
      { source: "/customers", destination: `${backendUrl}/customers` },
      { source: "/customers/:path*", destination: `${backendUrl}/customers/:path*` },
      { source: "/services", destination: `${backendUrl}/services` },
      { source: "/services/:path*", destination: `${backendUrl}/services/:path*` },
      { source: "/service-categories", destination: `${backendUrl}/service-categories` },
      { source: "/service-categories/:path*", destination: `${backendUrl}/service-categories/:path*` },
    ];
  },
};

export default nextConfig;
