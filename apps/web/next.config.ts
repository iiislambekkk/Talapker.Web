const createNextIntlPlugin = require('next-intl/plugin');
const withPWA = require('next-pwa')({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    exclude: []
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['pub-50614374e3ae4c0d88c3543f2f875fce.r2.dev']
    }
};

const withNextIntl = createNextIntlPlugin();

module.exports = withPWA(withNextIntl(nextConfig));