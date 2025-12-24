/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable experimental features for better performance
  experimental: {
    // Turbopack is enabled via --turbo flag in dev script
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default nextConfig
