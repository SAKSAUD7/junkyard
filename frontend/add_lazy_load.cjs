const fs = require('fs');

const filesToOptimize = [
    'src/components/VendorCard.jsx',
    'src/components/TrustedVendors.jsx'
];

filesToOptimize.forEach(filepath => {
    if (fs.existsSync(filepath)) {
        let content = fs.readFileSync(filepath, 'utf8');
        // add loading="lazy" if <img doesn't have it
        content = content.replace(/<img(.*?)>/g, (match, p1) => {
            if (!match.includes('loading=')) {
                return `<img${p1} loading="lazy">`;
            }
            return match;
        });
        fs.writeFileSync(filepath, content);
    }
});
console.log("Images optimized.");
