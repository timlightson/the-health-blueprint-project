/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // The link-in-bio page moved; keep the old URL working.
      { source: '/start', destination: '/links', permanent: false },
      // Preserve the original hydration article URL after correcting its premise.
      { source: '/learn/does-thirst-come-too-late', destination: '/learn/when-is-thirst-enough', permanent: true },
    ]
  },
}

export default nextConfig
