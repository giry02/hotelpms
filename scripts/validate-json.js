// Validate JSON files against sibling *.schema.json files using AJV.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    throw new Error(`${filePath}: ${error.message}`);
  }
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
    console.log(`${dataFile} ok`);
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
