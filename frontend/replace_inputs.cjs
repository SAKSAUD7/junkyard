const fs = require('fs');
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

// Add imports if they don't exist
if (!content.includes('AnimatedInput')) {
    content = content.replace(
        "import React",
        "import React from 'react'; // ensure React is imported\nimport AnimatedInput from './ui/AnimatedInput';\nimport AnimatedSelect from './ui/AnimatedSelect';\nimport"
    );
    // Let's do a more robust regex to insert at top
    // content = "import AnimatedInput from './ui/AnimatedInput';\nimport AnimatedSelect from './ui/AnimatedSelect';\n" + content;
}

// Replace <input... with <AnimatedInput... and <select with <AnimatedSelect
// But make sure we don't accidentally replace within names like handleInputChange.
// We use regex to only match tags.
content = content.replace(/<input\b/g, '<AnimatedInput');
content = content.replace(/<\/input>/g, '</AnimatedInput>');

content = content.replace(/<select\b/g, '<AnimatedSelect');
content = content.replace(/<\/select>/g, '</AnimatedSelect>');

// One more fix to avoid duplicate React import if not needed, we'll just insert at start
if (!content.includes("import AnimatedInput")) {
   content = "import AnimatedInput from './ui/AnimatedInput';\nimport AnimatedSelect from './ui/AnimatedSelect';\n" + content;
}

fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("Inputs replaced.");
