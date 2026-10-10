import fs from 'fs';
import path from 'path';

// 1. Client _redirects
const clientRedirectsPath = path.resolve('../E_commerce2/client/public/_redirects');
fs.writeFileSync(clientRedirectsPath, '/*    /index.html   200\n', 'utf8');
console.log('✓ Created client public/_redirects');

// 2. Client .env.example
const clientEnvExample = `# SEORA Customer Website Frontend - Environment Configuration
# Base API URL pointing to the deployed backend server (e.g. https://api.yourdomain.com/api or /api if proxied)
VITE_API_URL=https://api.yourdomain.com/api

# Optional Google OAuth Client ID (for OAuth sign-in)
# VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
`;
fs.writeFileSync(path.resolve('../E_commerce2/client/.env.example'), clientEnvExample, 'utf8');
console.log('✓ Created client .env.example');

// 3. Admin .env.example
const adminEnvExample = `# SEORA Administrative Control Center - Environment Configuration
# Base API URL pointing to the deployed backend server (e.g. https://api.yourdomain.com/api)
VITE_API_BASE_URL=https://api.yourdomain.com/api

# Customer Storefront URL (used for "Visit Storefront" navigation links)
VITE_CLIENT_URL=https://www.yourdomain.com
`;
fs.writeFileSync(path.resolve('.env.example'), adminEnvExample, 'utf8');
console.log('✓ Created admin .env.example');

// 4. Server .env.example
const serverEnvExample = `# SEORA Full-Stack Backend API - Environment Configuration
# Node runtime environment (development | production)
NODE_ENV=production

# Server listening port
PORT=5000

# MongoDB Atlas connection URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecom?retryWrites=true&w=majority

# JWT Authentication Secrets and Expiry
ACCESS_TOKEN_SECRET=your_long_cryptographically_secure_access_secret_key_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_long_cryptographically_secure_refresh_secret_key_here
REFRESH_TOKEN_EXPIRY=10d

# Allowed frontend client origins for CORS
CLIENT_URL=https://www.yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
FRONTEND_URL=https://www.yourdomain.com
`;
fs.writeFileSync(path.resolve('../E_commerce2/server/.env.example'), serverEnvExample, 'utf8');
console.log('✓ Created server .env.example');

console.log('All deployment environment templates created successfully!');
