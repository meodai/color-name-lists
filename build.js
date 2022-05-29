const lists = require('./index');
const fs = require('fs');

console.log(lists);

// create a JSON file containing all the lists
const output = JSON.stringify(lists, null, 2);
fs.writeFileSync('colorlists.json', output);
