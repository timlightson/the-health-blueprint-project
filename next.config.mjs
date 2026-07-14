/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // The link-in-bio page moved; keep the old URL working.
      { source: '/start', destination: '/links', permanent: false },
    ]
  },
}

export default nextConfig
