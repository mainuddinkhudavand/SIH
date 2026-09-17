import fs from 'fs';
import path from 'path';
import { generateMasterDataset } from './utils/masterDatasetGenerator.js';

const dataset = generateMasterDataset(1000);
const dataDir = path.join(process.cwd(), 'backend', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DEFAULT_PASSWORD = 'Citizen@123';

// Clean CSV for Excel with ONLY Name, Email, Password
const csvRows = ['Name,Email,Password'];

for (const c of dataset) {
  const email = c.email || `citizen.${c.citizenId.toLowerCase()}@govconnect.in`;
  const name = c.fullName;
  csvRows.push(`"${name}","${email}","${DEFAULT_PASSWORD}"`);
}

const csvPath = path.join(dataDir, '1000_citizens_name_email_password.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

console.log('✅ Exported Excel CSV with Name, Email, Password successfully:');
console.log('CSV Path:', csvPath);
