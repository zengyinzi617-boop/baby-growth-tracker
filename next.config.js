/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '') + '.supabase.co'],
  },
  transpilePackages: ['@supabase/ssr'],
}

module.exports = nextConfig
