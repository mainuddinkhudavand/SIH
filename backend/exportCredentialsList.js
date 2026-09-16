import fs from 'fs';
import path from 'path';
import { generateMasterDataset } from './utils/masterDatasetGenerator.js';

const dataset = generateMasterDataset(1000);
const dataDir = path.join(process.cwd(), 'backend', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default Password for all 1,000 citizens
const DEFAULT_PASSWORD = 'Citizen@123';

const credentialsList = dataset.map((c, index) => ({
  serialNo: index + 1,
  citizenId: c.citizenId,
  fullName: c.fullName,
  loginEmail: c.email || `citizen.${c.citizenId.toLowerCase()}@govconnect.in`,
  loginAadhaar: c.aadhaarId,
  loginPhone: c.phone || '9876543210',
  defaultPassword: DEFAULT_PASSWORD,
  role: 'citizen',
  isVerifiedAsset: c.isVerifiedAsset,
  surveyNumber: c.revenue?.surveyNumber,
  propertyId: c.municipality?.propertyId,
  khataNumber: c.talati?.khataNumber712
}));

// 1. Export Credentials JSON File
const jsonPath = path.join(dataDir, 'master_dataset_1000_members_credentials.json');
fs.writeFileSync(jsonPath, JSON.stringify(credentialsList, null, 2), 'utf8');

// 2. Export Credentials CSV File
const headers = ['Serial No', 'Citizen ID', 'Full Name', 'Login Email', 'Login Aadhaar ID', 'Login Phone', 'Default Password', 'Role', 'Asset Verified', 'Survey Number', 'Property ID', 'Khata Number'];

const csvRows = [headers.join(',')];

for (const cred of credentialsList) {
  const row = [
    cred.serialNo,
    cred.citizenId,
    `"${cred.fullName}"`,
    cred.loginEmail,
    `"${cred.loginAadhaar}"`,
    `"${cred.loginPhone}"`,
    `"${cred.defaultPassword}"`,
    cred.role,
    cred.isVerifiedAsset ? 'YES' : 'NO',
    cred.surveyNumber || '',
    cred.propertyId || '',
    cred.khataNumber || ''
  ];
  csvRows.push(row.join(','));
}

const csvPath = path.join(dataDir, 'master_dataset_1000_members_credentials.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

console.log('✅ Exported 1,000 member login credentials successfully:');
console.log('1. JSON Path:', jsonPath);
console.log('2. CSV Path :', csvPath);
