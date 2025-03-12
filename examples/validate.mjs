import { readFileSync } from 'fs';
import Ajv from 'ajv';
import { fileURLToPath } from 'url';
import path from 'path';

// Configuration
const SCHEMA_PATH = 'schema/character.schema.json';
const DATA_PATH = 'examples/example.character.json';
const ENCODING = 'utf-8';

// Get current file's directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads and parses a JSON file safely
 * @param {string} filePath - Path to the JSON file
 * @returns {object} Parsed JSON data
 * @throws {Error} If file reading or parsing fails
 */
function readJsonFile(filePath) {
  try {
    const absolutePath = path.resolve(__dirname, filePath);
    const fileContent = readFileSync(absolutePath, ENCODING);
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to read or parse ${filePath}: ${error.message}`);
  }
}

/**
 * Validates JSON data against a schema
 * @param {object} data - JSON data to validate
 * @param {object} schema - JSON schema to validate against
 * @returns {object} Validation result with isValid boolean and errors array
 */
function validateJson(data, schema) {
  try {
    const ajv = new Ajv({
      allErrors: true,      // Report all validation errors
      verbose: true,        // Include schema and data in error messages
      strict: true          // Enforce strict schema validation
    });

    const validate = ajv.compile(schema);
    const isValid = validate(data);

    return {
      isValid,
      errors: validate.errors || []
    };
  } catch (error) {
    throw new Error(`Validation process failed: ${error.message}`);
  }
}

// Main execution
function main() {
  try {
    // Load schema and data
    const schema = readJsonFile(SCHEMA_PATH);
    const data = readJsonFile(DATA_PATH);

    // Validate
    const { isValid, errors } = validateJson(data, schema);

    // Output results
    if (isValid) {
      console.log('✓ JSON file is valid against the schema');
    } else {
      console.error('✗ JSON file validation failed');
      console.error('Validation errors:');
      errors.forEach((error, index) => {
        console.error(`[${index + 1}] ${error.instancePath || 'root'}: ${error.message}`);
        console.error('Details:', JSON.stringify(error.params, null, 2));
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the validation
main();
