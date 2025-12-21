import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON data
const dataPath = path.join(__dirname, 'public/data/data_junkyards.json');
const vendorsPath = path.join(__dirname, 'public/images/vendors');

// Read existing data
const junkyards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Get all vendor logo files (excluding directories)
const vendorFiles = fs.readdirSync(vendorsPath).filter(file => {
    const filePath = path.join(vendorsPath, file);
    return fs.statSync(filePath).isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file);
});

console.log(`Found ${vendorFiles.length} vendor logo files`);
console.log(`Found ${junkyards.length} junkyard entries`);

// Create a CSV mapping file
let csvContent = 'ID,Vendor Name,City,State,Current Logo,Suggested Logo Filename\n';

junkyards.forEach(junkyard => {
    const currentLogo = junkyard.logo || '/images/logo-placeholder.png';
    csvContent += `${junkyard.id},"${junkyard.name}","${junkyard.city}","${junkyard.state}","${currentLogo}",""\n`;
});

// Write CSV file
const csvPath = path.join(__dirname, 'vendor-logo-mapping.csv');
fs.writeFileSync(csvPath, csvContent, 'utf8');

console.log(`\nCreated mapping file: ${csvPath}`);
console.log(`\nYou can now:`);
console.log(`1. Open vendor-logo-mapping.csv`);
console.log(`2. Fill in the "Suggested Logo Filename" column with the correct hash-based filename`);
console.log(`3. Run the apply-logo-mapping.js script to update the JSON`);

// Also list first 20 logo files for reference
console.log(`\nFirst 20 logo files for reference:`);
vendorFiles.slice(0, 20).forEach(file => {
    console.log(`  - ${file}`);
});
