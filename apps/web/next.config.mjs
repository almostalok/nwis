/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nwis/types', '@nwis/utils', '@nwis/api-client'],
};

export default nextConfig;
