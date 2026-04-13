const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Add imports
if (!content.includes('AnimatedPage')) {
  content = content.replace(
    "import { Routes, Route, Navigate, useParams } from 'react-router-dom'",
    "import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'\nimport { AnimatePresence } from 'framer-motion'\nimport AnimatedPage from './components/ui/AnimatedPage'"
  );
}

// Modify App function
if (!content.includes('const location = useLocation()')) {
  content = content.replace(
    "function App() {\n  return (",
    "function App() {\n  const location = useLocation()\n  return ("
  );
}

// Add AnimatePresence
if (!content.includes('<AnimatePresence mode="wait">')) {
  content = content.replace("<Routes>", '<AnimatePresence mode="wait">\n      <Routes location={location} key={location.pathname}>');
  content = content.replace("</Routes>", '</Routes>\n      </AnimatePresence>');
}

// Wrap elements with AnimatedPage
// Match element={<Component />} or element={<Component> ... </Component>}
content = content.replace(/element=\{<([A-Z][a-zA-Z0-9]*)([^>]*) \/>\}/g, "element={<AnimatedPage><$1$2 /></AnimatedPage>}");
// For specific nested elements like element={<ProtectedRoute> <AddYardPage /> </ProtectedRoute>}
// We will manually match those since they take multiple lines
content = content.replace(/element=\{\s*<ProtectedRoute>\s*<([A-Z][a-zA-Z0-9]*)\s*\/>\s*<\/ProtectedRoute>\s*\}/g, "element={<AnimatedPage><ProtectedRoute><$1 /></ProtectedRoute></AnimatedPage>}");

// and Vendor Routes, Admin Routes
content = content.replace(/element=\{\s*<VendorAuthProvider>\s*<([A-Z][a-zA-Z0-9]*)\s*\/>\s*<\/VendorAuthProvider>\s*\}/g, "element={<AnimatedPage><VendorAuthProvider><$1 /></VendorAuthProvider></AnimatedPage>}");

// For layouts that have nested blocks:
content = content.replace(/element=\{\s*<VendorAuthProvider>\s*<ProtectedVendorRoute>\s*<VendorLayout \/>\s*<\/ProtectedVendorRoute>\s*<\/VendorAuthProvider>\s*\}/g, "element={<AnimatedPage><VendorAuthProvider><ProtectedVendorRoute><VendorLayout /></ProtectedVendorRoute></VendorAuthProvider></AnimatedPage>}");

content = content.replace(/element=\{\s*<AdminProtectedRoute>\s*<AdminLayout \/>\s*<\/AdminProtectedRoute>\s*\}/g, "element={<AnimatedPage><AdminProtectedRoute><AdminLayout /></AdminProtectedRoute></AnimatedPage>}");

fs.writeFileSync('src/App.jsx', content);
console.log("App.jsx updated with AnimatedPage wraps.");
