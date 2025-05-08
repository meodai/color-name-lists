const fs = require('fs');
const path = require('path');
const libPath = path.join(__dirname, '../lib');
const directoryPath = path.join(libPath, 'colors');
const descriptions = require(libPath + '/descriptions.json');

const wikipediaList = require('wikipedia-color-names/colors.min.json');
const frenchList = require('recueil-de-couleur/colors.min.json');
const spasnishList = require('nombres-de-colores/colors.min.json');
const germanList = require('farbnamen/colors.min.json');
const ridgewayList = require('color-standards-and-color-nomenclature/dist/colornames.json');
const risographColors = require('riso-colors');

const hindiList = require('hindi-color-names/colors.min.json');

const hexColorValidation = /^#([0-9A-F]{3}){1,2}$/i;

// Collects all keys that are not in the allowed array and moves them to a meta object
function moveNonAllowedKeysToMeta(
  obj,
  allowed = ['name', 'hex'],
) {
  const returnObject = {...obj};
  const meta = {};
  let hadMeta = false;

  Object.keys(returnObject).forEach(key => {
    if (!allowed.includes(key)) {
      meta[key] = returnObject[key];
      delete returnObject[key];
      hadMeta = true;
    }
  });
  
  if (hadMeta) {
    returnObject.meta = meta;
  }

  return returnObject;
}

function toLowerKey(obj) {
  return Object.keys(obj).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = obj[key];
    return accumulator;
  }, {});
}

const jsonFiles = fs.readdirSync(directoryPath).filter(
  file => file.endsWith('.json')
);

function hyphensToCamelCase(str) {
  return str.replace(/-([a-zA-Z])/g, g => g[1].toUpperCase());
}

const lists = {};

lists.wikipedia = wikipediaList;
lists.french = frenchList;
lists.spanish = spasnishList;
lists.german = germanList;
lists.ridgway = ridgewayList;
lists.risograph = risographColors;
lists.hindi = hindiList;

jsonFiles.map(file => {
  const filePath = path.join(directoryPath, file);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const listOfColors = JSON.parse(fileContents);
  const listName = hyphensToCamelCase(file.replace('.json', ''));

  lists[listName] = listOfColors;
});

Object.keys(lists).forEach(listName => {
  const listOfColors = lists[listName];

  const sanitizedList = listOfColors.map(color => {
    const sanitizedColor = toLowerKey(color);
    const { hex } = sanitizedColor;

    if ( !hexColorValidation.test(hex) ) {
     throw console.error(`${hex} is not a valid hex color in "${listName}"`);
    }

    return moveNonAllowedKeysToMeta(
      sanitizedColor, 
      ['name', 'hex']
    );
  });

  lists[listName] = sanitizedList;
});

const sanitizedDescriptions = {};

Object.keys(descriptions).forEach(key => {
  const sanitizedKey = hyphensToCamelCase(key); 
  const description = descriptions[key];
  description.key = sanitizedKey;
  sanitizedDescriptions[sanitizedKey] = description;
  description.colorCount = lists[sanitizedKey].length;
});

module.exports = {
  lists,
  meta: sanitizedDescriptions
};