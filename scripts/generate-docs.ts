// scripts/generate-docs.ts
import { Parser } from '@dbml/core';
import fs from 'fs';

function generateMarkdownDocs(dbmlContent: string): string {
  const database = Parser.parse(dbmlContent, 'dbml');
  let markdown = '# Database Schema Documentation\n\n';

  // Generate table documentation
  database.schemas[0].tables.forEach((table) => {
    markdown += `## ${table.name}\n\n`;
    markdown += `${table.note || ''}\n\n`;
    markdown += '| Column | Type | Constraints | Description |\n';
    markdown += '|--------|------|-------------|-------------|\n';

    table.fields.forEach((field) => {
      const constraints = [] as Array<String>;
      if (field.pk) constraints.push('PK');
      if (field.unique) constraints.push('UNIQUE');
      if (field.not_null) constraints.push('NOT NULL');

      markdown += `| ${field.name} | ${field.type.type_name} | ${constraints.join(', ')} | ${field.note || ''} |\n`;
    });

    markdown += '\n';
  });

  return markdown;
}
