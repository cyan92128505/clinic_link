import { Parser } from '@dbml/core';
import * as fs from 'fs-extra';
import * as path from 'path'; // Fix: Change to import all

function convertDbmlToDrizzle(dbmlContent: string): string {
  const database = Parser.parse(dbmlContent, 'dbml');
  let output = `import { pgTable, pgEnum, text, integer, boolean, timestamp, jsonb, unique, index } from 'drizzle-orm/pg-core';\n`;
  output += `import { relations } from 'drizzle-orm';\n`;
  output += `import { createId } from '@paralleldrive/cuid2';\n\n`; // Fix: Import createId instead of cuid

  // Generate enums
  database.schemas[0].enums.forEach((enumDef) => {
    output += `export const ${snakeToCamel(enumDef.name)}Enum = pgEnum('${enumDef.name}', [\n`;
    enumDef.values.forEach((value) => {
      output += `  '${value.name}',\n`;
    });
    output += `]);\n\n`;
  });

  // Generate tables
  database.schemas[0].tables.forEach((table) => {
    output += `export const ${snakeToCamel(table.name)} = pgTable('${table.name}', {\n`;

    table.fields.forEach((field) => {
      const fieldName = snakeToCamel(field.name);
      let fieldDef = `  ${fieldName}: `;

      // Convert field type
      switch (field.type.type_name.toLowerCase()) {
        case 'varchar':
          fieldDef += `text('${field.name}')`;
          break;
        case 'int':
        case 'integer':
          fieldDef += `integer('${field.name}')`;
          break;
        case 'boolean':
          fieldDef += `boolean('${field.name}')`;
          break;
        case 'timestamp':
          fieldDef += `timestamp('${field.name}', { withTimezone: true })`;
          break;
        case 'jsonb':
          fieldDef += `jsonb('${field.name}')`;
          break;
        default:
          if (
            database.schemas[0].enums.some(
              (e) => e.name === field.type.type_name,
            )
          ) {
            fieldDef += `${snakeToCamel(field.type.type_name)}Enum('${field.name}')`;
          } else {
            fieldDef += `text('${field.name}')`;
          }
      }

      // Add constraints
      if (field.pk) {
        fieldDef += `.primaryKey()`;
      }
      if (field.unique) {
        fieldDef += `.unique()`;
      }
      if (field.not_null) {
        fieldDef += `.notNull()`;
      }
      if (field.dbdefault) {
        if (
          field.dbdefault.type === 'expression' &&
          field.dbdefault.value === 'now()'
        ) {
          fieldDef += `.defaultNow()`;
        } else if (field.dbdefault.type === 'boolean') {
          fieldDef += `.default(${field.dbdefault.value})`;
        } else if (field.dbdefault.type === 'string') {
          fieldDef += `.default('${field.dbdefault.value}')`;
        }
      }
      if (field.name === 'id' && field.note === 'cuid') {
        fieldDef += `.$defaultFn(() => createId())`;
      }
      if (field.name === 'updated_at') {
        fieldDef += `.$onUpdate(() => new Date())`;
      }

      output += fieldDef + ',\n';
    });

    output += `}, (table) => {\n`;
    output += `  return {\n`;

    // Add indexes
    table.indexes.forEach((index, i) => {
      if (index.unique) {
        output += `    unique${i}: unique().on(${index.columns.map((col) => `table.${snakeToCamel(col.value)}`).join(', ')}),\n`;
      } else {
        output += `    idx${i}: index().on(${index.columns.map((col) => `table.${snakeToCamel(col.value)}`).join(', ')}),\n`;
      }
    });

    output += `  };\n`;
    output += `});\n\n`;
  });

  // Generate relations
  database.schemas[0].tables.forEach((table) => {
    const relations = [] as Array<any>;

    // Find foreign key relations
    database.schemas[0].refs.forEach((ref) => {
      if (ref.endpoints[0].tableName === table.name) {
        relations.push({
          name: snakeToCamel(ref.endpoints[1].tableName),
          type: 'one',
          fields: ref.endpoints[0].fieldNames,
          references: ref.endpoints[1].fieldNames,
          referencedTable: ref.endpoints[1].tableName,
        });
      }
      if (ref.endpoints[1].tableName === table.name) {
        relations.push({
          name: snakeToCamel(ref.endpoints[0].tableName) + 's',
          type: 'many',
          referencedTable: ref.endpoints[0].tableName,
        });
      }
    });

    if (relations.length > 0) {
      output += `export const ${snakeToCamel(table.name)}Relations = relations(${snakeToCamel(table.name)}, ({ one, many }) => ({\n`;

      relations.forEach((rel) => {
        if (rel.type === 'one') {
          output += `  ${rel.name}: one(${snakeToCamel(rel.referencedTable)}, {\n`;
          output += `    fields: [${rel.fields.map((f) => `${snakeToCamel(table.name)}.${snakeToCamel(f)}`).join(', ')}],\n`;
          output += `    references: [${rel.references.map((f) => `${snakeToCamel(rel.referencedTable)}.${snakeToCamel(f)}`).join(', ')}],\n`;
          output += `  }),\n`;
        } else {
          output += `  ${rel.name}: many(${snakeToCamel(rel.referencedTable)}),\n`;
        }
      });

      output += `}));\n\n`;
    }
  });

  return output;
}

function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', ''),
  );
}

async function main() {
  try {
    const dbmlFilePath = path.join(process.cwd(), 'docs', 'schema.dbml');
    console.log('Reading DBML file from:', dbmlFilePath);

    // Check if file exists
    if (!(await fs.pathExists(dbmlFilePath))) {
      throw new Error(`DBML file not found at: ${dbmlFilePath}`);
    }

    const dbmlContent = await fs.readFile(dbmlFilePath, { encoding: 'utf-8' });

    const drizzleSchema = convertDbmlToDrizzle(dbmlContent);

    const outputPath = path.join(
      process.cwd(),
      'src',
      'infrastructure',
      'database',
      'drizzle',
      'generated.ts',
    );

    // Ensure the directory exists
    await fs.ensureDir(path.dirname(outputPath));

    await fs.writeFile(outputPath, drizzleSchema, { encoding: 'utf-8' });

    console.log('Successfully generated Drizzle schema at:', outputPath);
  } catch (error) {
    console.error('Error generating Drizzle schema:', error);
    process.exit(1);
  }
}

main();
