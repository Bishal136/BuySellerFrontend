const fs = require('fs');
const content = fs.readFileSync('/home/bishal/BishalHome/Cours/Ecommarce/Deepshik/App/src/pages/admin/Settings.jsx', 'utf-8');
if (content.includes('error')) console.log("Has error handlers");
