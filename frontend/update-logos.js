import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON data
const dataPath = path.join(__dirname, 'public/data/data_junkyards.json');
const placeholderLogo = '/images/logo-placeholder.png';

// Read existing data
const junkyards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`Processing ${junkyards.length} junkyard entries...`);

let updated = 0;
let alreadyHadLogo = 0;

// Ensure every entry has a logo field
junkyards.forEach(junkyard => {
    if (!junkyard.logo) {
        junkyard.logo = placeholderLogo;
        updated++;
    } else {
        alreadyHadLogo++;
    }
});

// Write updated data back
fs.writeFileSync(dataPath, JSON.stringify(junkyards, null, 4), 'utf8');

console.log(`\n=== Summary ===`);
console.log(`Total junkyards: ${junkyards.length}`);
console.log(`Added placeholder logo: ${updated}`);
console.log(`Already had logo: ${alreadyHadLogo}`);
console.log(`\nAll entries now have a logo field!`);
console.log(`Updated file: ${dataPath}`);
