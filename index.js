const { on } = require('events');
const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, 'lib/colors');

const wikipediaList = require('wikipedia-color-names/colors.min.json');

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

function toLowerKeys(obj) {
  return Object.keys(obj).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = obj[key];
    return accumulator;
  }, {});
}

const jsonFiles = fs.readdirSync(directoryPath).filter(
  file => file.endsWith('.json')
);

function hyphensToCamelCase(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

const lists = {};

lists.wikipedia = wikipediaList;

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
    const sanitizedColor = toLowerKeys(color);
    return moveNonAllowedKeysToMeta(sanitizedColor, ['name', 'hex']);
  });

  lists[listName] = sanitizedList;
});

module.exports = lists;