import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "ojaocusmvvcbufgoqerm.supabase.co" },
    ],
  },
  // Packages that must stay server-side (native deps used by the RAG pipeline).
  serverExternalPackages: ["pdf-parse"],
}

export default nextConfig
