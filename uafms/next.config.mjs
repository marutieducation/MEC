/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://mec-backend.onrender.com/api' : 'http://localhost:10000/api');
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || apiUrl.replace(/\/api\/?$/, '');
const backendOrigin = apiUrl.replace(/\/api\/?$/, '');

const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SOCKET_URL: socketUrl,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/signup',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
