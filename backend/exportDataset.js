import fs from 'fs';
import path from 'path';
import { generateMasterDataset } from './utils/masterDatasetGenerator.js';

const dataset = generateMasterDataset(1000);
const dataDir = path.join(process.cwd(), 'backend', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Export JSON File
const jsonPath = path.join(dataDir, 'master_dataset_1000_members.json');
fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2), 'utf8');

// 2. Export CSV File
const headers = [
  'Citizen ID', 'Full Name', 'Phone', 'Email', 'Aadhaar ID', 'PAN Number', 'Voter ID',
  'Address', 'Ward Code', 'Village Code', 'Asset Usage', 'Plot Area/Size', 'Plot Location',
  'Survey Number', 'Property ID', 'Khata Number', 'Asset Verification Status',
  'Municipal Property Tax Status', 'Municipal Tax Arrears (Rs)', 'Tehsildar Annual Income (Rs)',
  'Caste Category', 'Revenue Tax Status', 'Pending Revenue Dues (Rs)', 'Talati 7-12 Khata No', 'Ration Card Type'
];

const csvRows = [headers.join(',')];

for (const c of dataset) {
  const row = [
    c.citizenId,
    `"${c.fullName}"`,
    `"${c.phone}"`,
    c.email,
    `"${c.aadhaarId}"`,
    c.panNumber,
    c.voterId,
    `"${c.address}"`,
    c.wardCode,
    c.villageCode,
    `"${c.assetDetails?.usageType || ''}"`,
    `"${c.assetDetails?.plotAreaSize || ''}"`,
    `"${c.assetDetails?.plotLocation || ''}"`,
    c.revenue?.surveyNumber || '',
    c.municipality?.propertyId || '',
    c.talati?.khataNumber712 || '',
    c.isVerifiedAsset ? 'VERIFIED_ASSET' : 'PENDING_VERIFICATION',
    c.municipality?.taxStatus || '',
    c.municipality?.pendingTaxArrears || 0,
    c.tehsildar?.annualIncome || 0,
    c.tehsildar?.casteCategory || '',
    c.revenue?.revenueTaxStatus || '',
    c.revenue?.pendingRevenueDues || 0,
    c.talati?.khataNumber712 || '',
    c.talati?.rationCardType || ''
  ];
  csvRows.push(row.join(','));
}

const csvPath = path.join(dataDir, 'master_dataset_1000_members.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

console.log('✅ Exported 1,000 member dataset successfully:');
console.log('1. JSON Path:', jsonPath);
console.log('2. CSV Path :', csvPath);
