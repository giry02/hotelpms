// scripts/validate-json.js – Validate JSON files against their schemas using AJV
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, strict: false });

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function validateFile(dataFile, schemaFile) {
  const data = loadJSON(dataFile);
  const schema = loadJSON(schemaFile);
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    console.error(`Validation errors in ${dataFile}:`);
    console.error(validate.errors);
    process.exitCode = 1;
  } else {
    console.log(`${dataFile} ✅`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // look for sibling .schema.json file
      const schemaPath = fullPath.replace(/\.json$/, '.schema.json');
      if (fs.existsSync(schemaPath)) {
        validateFile(fullPath, schemaPath);
      }
    }
  }
}

// Start from the project root's "dashboard/data" directory
const dataRoot = path.resolve(__dirname, '..', 'dashboard', 'data');
walk(dataRoot);
