/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GITHUB_REPO: process.env.GITHUB_REPO || 'zestyclose-steak7679/polybot-prediction-system',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  },
}

module.exports = nextConfig
