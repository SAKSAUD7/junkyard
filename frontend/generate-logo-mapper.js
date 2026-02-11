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
    const stat = fs.statSync(filePath);
    return stat.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file);
});

console.log(`Found ${junkyards.length} vendors`);
console.log(`Found ${vendorFiles.length} logo files`);

// Create an HTML page for manual mapping
let html = `<!DOCTYPE html>
<html>
<head>
    <title>Vendor Logo Mapper</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .vendor-list { border: 1px solid #ccc; padding: 10px; }
        .logo-grid { border: 1px solid #ccc; padding: 10px; }
        .vendor-item { padding: 5px; margin: 5px 0; background: #f0f0f0; cursor: pointer; }
        .vendor-item:hover { background: #e0e0e0; }
        .vendor-item.selected { background: #4CAF50; color: white; }
        .logo-item { display: inline-block; margin: 10px; text-align: center; cursor: pointer; border: 2px solid transparent; }
        .logo-item:hover { border-color: #2196F3; }
        .logo-item.selected { border-color: #4CAF50; }
        .logo-item img { max-width: 150px; max-height: 100px; display: block; }
        .logo-item .filename { font-size: 10px; word-break: break-all; max-width: 150px; }
        .mapping-output { margin-top: 20px; padding: 10px; background: #f9f9f9; border: 1px solid #ccc; }
        .mapping-output textarea { width: 100%; height: 200px; font-family: monospace; }
        button { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; margin: 5px; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>Vendor Logo Mapper</h1>
    <p>Click a vendor, then click its corresponding logo. The mapping will be generated below.</p>
    
    <div class="container">
        <div class="vendor-list">
            <h2>Vendors (${junkyards.length})</h2>
            <div id="vendors">
`;

junkyards.forEach(vendor => {
    html += `                <div class="vendor-item" data-id="${vendor.id}" data-name="${vendor.name.replace(/"/g, '&quot;')}">
                    ${vendor.id}. ${vendor.name} (${vendor.city}, ${vendor.state})
                </div>\n`;
});

html += `            </div>
        </div>
        
        <div class="logo-grid">
            <h2>Available Logos (${vendorFiles.length})</h2>
            <div id="logos">
`;

vendorFiles.forEach(file => {
    html += `                <div class="logo-item" data-filename="${file}">
                    <img src="/images/vendors/${file}" alt="${file}" onerror="this.src='/images/logo-placeholder.png'">
                    <div class="filename">${file}</div>
                </div>\n`;
});

html += `            </div>
        </div>
    </div>
    
    <div class="mapping-output">
        <h2>Generated Mapping</h2>
        <button onclick="copyMapping()">Copy to Clipboard</button>
        <button onclick="downloadMapping()">Download as JSON</button>
        <button onclick="clearMapping()">Clear All</button>
        <textarea id="mapping" readonly></textarea>
    </div>

    <script>
        let selectedVendor = null;
        let mapping = {};
        
        // Load existing mapping from localStorage
        const savedMapping = localStorage.getItem('vendorLogoMapping');
        if (savedMapping) {
            mapping = JSON.parse(savedMapping);
            updateMappingDisplay();
        }
        
        document.querySelectorAll('.vendor-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.vendor-item').forEach(v => v.classList.remove('selected'));
                this.classList.add('selected');
                selectedVendor = {
                    id: this.dataset.id,
                    name: this.dataset.name
                };
            });
        });
        
        document.querySelectorAll('.logo-item').forEach(item => {
            item.addEventListener('click', function() {
                if (!selectedVendor) {
                    alert('Please select a vendor first!');
                    return;
                }
                
                const filename = this.dataset.filename;
                mapping[selectedVendor.id] = {
                    name: selectedVendor.name,
                    logo: '/images/vendors/' + filename
                };
                
                // Save to localStorage
                localStorage.setItem('vendorLogoMapping', JSON.stringify(mapping));
                
                updateMappingDisplay();
                
                // Move to next vendor
                const currentVendor = document.querySelector('.vendor-item.selected');
                const nextVendor = currentVendor.nextElementSibling;
                if (nextVendor) {
                    nextVendor.click();
                }
            });
        });
        
        function updateMappingDisplay() {
            const textarea = document.getElementById('mapping');
            textarea.value = JSON.stringify(mapping, null, 2);
            
            // Highlight mapped vendors
            document.querySelectorAll('.vendor-item').forEach(item => {
                if (mapping[item.dataset.id]) {
                    item.style.borderLeft = '4px solid #4CAF50';
                }
            });
        }
        
        function copyMapping() {
            const textarea = document.getElementById('mapping');
            textarea.select();
            document.execCommand('copy');
            alert('Mapping copied to clipboard!');
        }
        
        function downloadMapping() {
            const dataStr = JSON.stringify(mapping, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'vendor-logo-mapping.json';
            link.click();
        }
        
        function clearMapping() {
            if (confirm('Are you sure you want to clear all mappings?')) {
                mapping = {};
                localStorage.removeItem('vendorLogoMapping');
                updateMappingDisplay();
                document.querySelectorAll('.vendor-item').forEach(item => {
                    item.style.borderLeft = 'none';
                });
            }
        }
    </script>
</body>
</html>`;

// Write HTML file
const htmlPath = path.join(__dirname, 'public/logo-mapper.html');
fs.writeFileSync(htmlPath, html, 'utf8');

console.log(`\nCreated logo mapper tool: ${htmlPath}`);
console.log(`\nOpen http://localhost:3000/logo-mapper.html in your browser to map logos!`);
console.log(`\nOnce you've mapped all logos, download the JSON and I'll apply it to your data.`);
