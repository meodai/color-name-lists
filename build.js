const path = require('path');
const lists = require('./src/index');
const fs = require('fs');
const distPath = path.join(__dirname, 'dist/');

// create a JSON file containing all the lists
const output = JSON.stringify(lists, null, 2);
fs.writeFileSync(distPath + 'colorlists.json', output);
