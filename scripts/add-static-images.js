import fs from 'fs';
import path from 'path';

const serverPath = path.resolve('../E_commerce2/server/server.js');
let content = fs.readFileSync(serverPath, 'utf8');

if (!content.includes('/images')) {
  content = content.replace(
    "app.use(morgan('dev'));",
    "app.use(morgan('dev'));\n\n// Serve static product images\napp.use('/images', express.static(path.resolve(__dirname, '../client/public/images')));"
  );
  fs.writeFileSync(serverPath, content, 'utf8');
  console.log('✓ Added static /images route in server.js');
} else {
  console.log('Static /images already configured in server.js');
}
