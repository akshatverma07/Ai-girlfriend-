import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
    typescript: {
        ignoreBuildErrors: true,
          },
          
output: 'export',
  
    // Agar images ki wajah se export mein issue aaye toh yeh bhi daal sakte ho:
      images: {
          unoptimized: true,
            },
            };

            export default nextConfig;
        
        