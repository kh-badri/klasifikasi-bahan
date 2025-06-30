/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Menghilangkan indikator build
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
}

module.exports = nextConfig