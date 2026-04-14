const fs = require('fs');

function replaceButtonsInFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Add imports
    if (!content.includes('AnimatedButton')) {
        content = "import AnimatedButton from './ui/AnimatedButton';\n" + content;
    }

    // Replace button tags
    content = content.replace(/<button\b/g, '<AnimatedButton');
    content = content.replace(/<\/button>/g, '</AnimatedButton>');

    fs.writeFileSync(filepath, content);
}

replaceButtonsInFile('src/components/LeadForm.jsx');
// Also replace in VendorCard, Home, etc if applicable and safe
console.log("Buttons replaced in LeadForm.");
