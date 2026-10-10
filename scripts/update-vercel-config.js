import fs from 'fs';
import path from 'path';

const vercelJsonPath = path.resolve('../E_commerce2/vercel.json');
const vercelConfig = {
  version: 2,
  buildCommand: "npm run build --workspace=client",
  outputDirectory: "client/dist",
  rewrites: [
    {
      source: "/api/(.*)",
      destination: "/api/index.js"
    },
    {
      source: "/(.*)",
      destination: "/index.html"
    }
  ]
};

fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2), 'utf8');
console.log('✓ Updated E_commerce2/vercel.json with standard universal Vercel deployment configuration');
