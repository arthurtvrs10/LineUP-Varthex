#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const errors = [];
const warnings = [];
const temporaryMarkers = ["TO" + "DO", "T" + "BD", "A " + "DEFINIR"];
const releaseOrder = new Map([
  ["MVP", 1],
  ["INTERMEDIARIO", 2],
  ["FINAL", 3],
]);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message) {
  errors.push(message);
}

function parseCsv(text, source) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (character === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) fail(`${source}: aspas não fechadas`);
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  if (rows.length === 0) {
    fail(`${source}: CSV vazio`);
    return { headers: [], records: [] };
  }

  const headers = rows[0];
  const records = rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      fail(`${source}:${index + 2}: ${values.length} colunas; esperado ${headers.length}`);
    }
    return Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ""]));
  });
  return { headers, records };
}

function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (!value) {
      fail(`${label}: valor vazio`);
    } else if (seen.has(value)) {
      fail(`${label}: valor duplicado ${value}`);
    } else {
      seen.add(value);
    }
  }
  return seen;
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

let manifest;
try {
  manifest = JSON.parse(read("manifest.json"));
} catch (error) {
  fail(`manifest.json inválido: ${error.message}`);
  manifest = { requiredFiles: [], canonicalSources: {} };
}

for (const relativePath of manifest.requiredFiles ?? []) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    fail(`arquivo obrigatório ausente: ${relativePath}`);
  }
}
for (const [name, relativePath] of Object.entries(manifest.canonicalSources ?? {})) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    fail(`fonte canônica ausente (${name}): ${relativePath}`);
  }
}

try {
  JSON.parse(read("07-design-system/design-tokens.json"));
} catch (error) {
  fail(`design-tokens.json inválido: ${error.message}`);
}

const requirementText = read("02-requisitos/01-catalogo-requisitos.md");
const requirementMatches = [
  ...requirementText.matchAll(
    /^\|\s*`(RF-[A-Z]+-\d{3})`\s*\|\s*(MVP|INTERMEDIARIO|FINAL)\s*\|/gm,
  ),
];
const requirementIds = unique(
  requirementMatches.map((match) => match[1]),
  "requisito",
);
const requirementRelease = new Map(
  requirementMatches.map((match) => [match[1], match[2]]),
);
if (requirementIds.size === 0) fail("nenhum requisito canônico encontrado");

const businessRuleIds = unique(
  [
    ...read("02-requisitos/02-regras-negocio.md").matchAll(
      /^\|\s*`(RN-[A-Z]+-\d{3})`\s*\|/gm,
    ),
  ].map((match) => match[1]),
  "regra de negócio",
);
const entityMatches = [
  ...read("03-dominio-dados/01-catalogo-entidades.md").matchAll(
    /^\|\s*`(ENT-[A-Z-]+)`\s*\|\s*`[^`]+`\s*\|\s*(MVP|INTERMEDIARIO|FINAL)\s*\|/gm,
  ),
];
const entityIds = unique(
  entityMatches.map((match) => match[1]),
  "entidade",
);
const entityRelease = new Map(
  entityMatches.map((match) => [match[1], match[2]]),
);
const screenIds = unique(
  [
    ...read("06-frontend-ux/02-catalogo-telas-fluxos.md").matchAll(
      /^\|\s*`(TEL-[A-Z-]+)`\s*\|/gm,
    ),
  ].map((match) => match[1]),
  "tela",
);

const dataCatalog = parseCsv(read("03-dominio-dados/catalogo-dados.csv"), "catalogo-dados.csv");
const expectedDataHeaders = [
  "field_id",
  "owner",
  "concept",
  "java_name",
  "java_type",
  "db_column",
  "sql_type",
  "api_name",
  "typescript_type",
  "nullable",
  "validation",
  "release",
  "data_classification",
  "reference",
];
for (const header of expectedDataHeaders) {
  if (!dataCatalog.headers.includes(header)) fail(`catalogo-dados.csv: coluna ausente ${header}`);
}
unique(dataCatalog.records.map((record) => record.field_id), "field_id");
const apiNameExceptions = new Map([["API-NAME-SNAPSHOT", "name"]]);
const dbColumnExceptions = new Map([
  ["ROL-KEY", "role_key"],
  ["RCR-RRULE", "recurrence_rule"],
  ["RCR-COUNT", "occurrence_count"],
  ["MTP-KEY", "template_key"],
]);
for (const record of dataCatalog.records) {
  for (const header of expectedDataHeaders) {
    if (!record[header]) {
      fail(`catalogo-dados.csv ${record.owner}:${record.field_id}: ${header} vazio`);
    }
  }
  if (!["YES", "NO"].includes(record.nullable)) {
    fail(`catalogo-dados.csv ${record.owner}:${record.field_id}: nullable inválido`);
  }
  if (!["MVP", "INTERMEDIARIO", "FINAL"].includes(record.release)) {
    fail(`catalogo-dados.csv ${record.owner}:${record.field_id}: release inválida`);
  }
  if (
    !["PUBLIC", "INTERNAL", "PERSONAL", "SENSITIVE", "SECRET"].includes(
      record.data_classification,
    )
  ) {
    fail(
      `catalogo-dados.csv ${record.owner}:${record.field_id}: classificação inválida`,
    );
  }
  if (!/^[a-z][A-Za-z0-9]*$/.test(record.java_name)) {
    fail(`catalogo-dados.csv ${record.owner}:${record.field_id}: java_name inválido`);
  }
  if (!/^[a-z][a-z0-9_]*$/.test(record.db_column)) {
    fail(`catalogo-dados.csv ${record.owner}:${record.field_id}: db_column inválido`);
  }
  if (record.api_name !== "-" && !/^[a-z][A-Za-z0-9]*$/.test(record.api_name)) {
    fail(`catalogo-dados.csv ${record.owner}:${record.field_id}: api_name inválido`);
  }
  if (
    record.api_name !== "-" &&
    record.api_name !== record.java_name &&
    apiNameExceptions.get(record.field_id) !== record.api_name
  ) {
    fail(
      `catalogo-dados.csv ${record.field_id}: api_name ${record.api_name} diverge de java_name ${record.java_name}`,
    );
  }
  const expectedDbColumn = record.java_name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();
  if (
    record.db_column !== expectedDbColumn &&
    dbColumnExceptions.get(record.field_id) !== record.db_column
  ) {
    fail(
      `catalogo-dados.csv ${record.field_id}: db_column ${record.db_column} diverge de ${expectedDbColumn}`,
    );
  }
  if (record.owner.startsWith("ENT-") && !entityIds.has(record.owner)) {
    fail(`catalogo-dados.csv: owner não catalogado ${record.owner}`);
  }
  if (record.reference.startsWith("ENT-") && !entityIds.has(record.reference)) {
    fail(`catalogo-dados.csv ${record.field_id}: entidade de referência inexistente`);
  }
  if (record.reference.startsWith("RF-") && !requirementIds.has(record.reference)) {
    fail(`catalogo-dados.csv ${record.field_id}: requisito de referência inexistente`);
  }
  if (record.reference.startsWith("RN-") && !businessRuleIds.has(record.reference)) {
    fail(`catalogo-dados.csv ${record.field_id}: regra de referência inexistente`);
  }
  if (
    record.owner.startsWith("ENT-") &&
    releaseOrder.get(record.release) < releaseOrder.get(entityRelease.get(record.owner))
  ) {
    fail(
      `catalogo-dados.csv ${record.field_id}: release anterior à entidade ${record.owner}`,
    );
  }
}
for (const entityId of entityIds) {
  if (!dataCatalog.records.some((record) => record.owner === entityId)) {
    fail(`entidade sem campos próprios no catálogo: ${entityId}`);
  }
}

const traceability = parseCsv(
  read("09-testes/matriz-rastreabilidade.csv"),
  "matriz-rastreabilidade.csv",
);
const expectedTraceHeaders = [
  "requirement_id",
  "business_rule_ids",
  "entity_ids",
  "api_operation_ids",
  "screen_ids",
  "test_case_ids",
  "release",
];
for (const header of expectedTraceHeaders) {
  if (!traceability.headers.includes(header)) {
    fail(`matriz-rastreabilidade.csv: coluna ausente ${header}`);
  }
}
unique(
  traceability.records.map((record) => record.requirement_id),
  "rastreabilidade por requisito",
);
for (const record of traceability.records) {
  if (!requirementIds.has(record.requirement_id)) {
    fail(`rastreabilidade aponta requisito inexistente: ${record.requirement_id}`);
  }
  if (!["MVP", "INTERMEDIARIO", "FINAL"].includes(record.release)) {
    fail(`rastreabilidade ${record.requirement_id}: release inválida`);
  }
  if (requirementRelease.get(record.requirement_id) !== record.release) {
    fail(
      `rastreabilidade ${record.requirement_id}: release ${record.release} diverge do catálogo`,
    );
  }
  for (const ruleId of record.business_rule_ids.split("|").filter(Boolean)) {
    if (!businessRuleIds.has(ruleId)) {
      fail(`rastreabilidade ${record.requirement_id}: regra inexistente ${ruleId}`);
    }
  }
  for (const entityId of record.entity_ids.split("|").filter(Boolean)) {
    if (!entityIds.has(entityId)) {
      fail(`rastreabilidade ${record.requirement_id}: entidade inexistente ${entityId}`);
    }
  }
  for (const screenId of record.screen_ids.split("|").filter(Boolean)) {
    if (!screenIds.has(screenId)) {
      fail(`rastreabilidade ${record.requirement_id}: tela inexistente ${screenId}`);
    }
  }
  const [, domain, number] =
    record.requirement_id.match(/^RF-([A-Z]+)-(\d{3})$/) ?? [];
  const acceptanceCase = `CT-${domain}-RF${number}`;
  const testCases = record.test_case_ids.split("|").filter(Boolean);
  if (!testCases.includes(acceptanceCase)) {
    fail(
      `rastreabilidade ${record.requirement_id}: caso-base ausente ${acceptanceCase}`,
    );
  }
}
for (const requirementId of requirementIds) {
  if (!traceability.records.some((record) => record.requirement_id === requirementId)) {
    fail(`requisito sem rastreabilidade: ${requirementId}`);
  }
}

const openapi = read("05-api-integracoes/openapi.yaml");
if (!/^openapi:\s+3\.1\.1\s*$/m.test(openapi)) {
  fail("openapi.yaml: versão deve ser 3.1.1");
}
const operationMatches = [
  ...openapi.matchAll(
    /^\s+operationId:\s*([A-Za-z][A-Za-z0-9]*)\s*\n\s+x-release:\s*(MVP|INTERMEDIARIO|FINAL)\s*$/gm,
  ),
];
const operationIds = unique(
  operationMatches.map((match) => match[1]),
  "OpenAPI operationId",
);
const operationRelease = new Map(
  operationMatches.map((match) => [match[1], match[2]]),
);
const releaseMarkers = [...openapi.matchAll(/^\s+x-release:\s*(MVP|INTERMEDIARIO|FINAL)\s*$/gm)];
if (releaseMarkers.length !== operationIds.size) {
  fail(
    `openapi.yaml: ${operationIds.size} operationIds e ${releaseMarkers.length} marcadores x-release`,
  );
}
const tracedOperations = new Set();
for (const record of traceability.records) {
  for (const operationId of record.api_operation_ids.split("|").filter(Boolean)) {
    if (!operationIds.has(operationId)) {
      fail(`rastreabilidade ${record.requirement_id}: operationId inexistente ${operationId}`);
      continue;
    }
    tracedOperations.add(operationId);
    if (
      releaseOrder.get(operationRelease.get(operationId)) >
      releaseOrder.get(record.release)
    ) {
      fail(
        `rastreabilidade ${record.requirement_id}: usa ${operationId} de release posterior`,
      );
    }
  }
}
for (const operationId of operationIds) {
  if (!tracedOperations.has(operationId)) {
    fail(`OpenAPI operationId sem requisito rastreado: ${operationId}`);
  }
}

for (const componentType of ["schemas", "parameters", "responses", "securitySchemes"]) {
  const sectionHeader = new RegExp(`^  ${componentType}:\\s*$`, "m").exec(openapi);
  if (!sectionHeader) {
    fail(`openapi.yaml: seção components/${componentType} ausente`);
    continue;
  }
  const remaining = openapi.slice(
    sectionHeader.index + sectionHeader[0].length + 1,
  );
  const nextSection = remaining.search(/^  [A-Za-z][A-Za-z0-9]*:\s*$/m);
  const section = nextSection >= 0 ? remaining.slice(0, nextSection) : remaining;
  const definitions = new Set(
    [...section.matchAll(/^    ([A-Za-z][A-Za-z0-9]*):/gm)].map(
      (match) => match[1],
    ),
  );
  const references = [
    ...openapi.matchAll(
      new RegExp(
        `#/components/${componentType}/([A-Za-z][A-Za-z0-9]*)`,
        "g",
      ),
    ),
  ].map((match) => match[1]);
  for (const reference of references) {
    if (!definitions.has(reference)) {
      fail(`openapi.yaml: referência não resolvida ${componentType}/${reference}`);
    }
  }
}

const allFiles = walk(root);
for (const filePath of allFiles) {
  const relativePath = path.relative(root, filePath);
  const text = fs.readFileSync(filePath, "utf8");
  if (temporaryMarkers.some((marker) => text.includes(marker))) {
    fail(`${relativePath}: marcador temporário proibido`);
  }
  if (filePath.endsWith(".md")) {
    const links = [...text.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1].trim());
    for (const link of links) {
      if (
        !link ||
        link.startsWith("#") ||
        /^(?:https?:|mailto:|tel:)/i.test(link)
      ) {
        continue;
      }
      const target = decodeURIComponent(link.split("#")[0]);
      if (!fs.existsSync(path.resolve(path.dirname(filePath), target))) {
        fail(`${relativePath}: link relativo quebrado ${link}`);
      }
    }
  }
}

const summary = {
  requiredFiles: manifest.requiredFiles?.length ?? 0,
  requirements: requirementIds.size,
  businessRules: businessRuleIds.size,
  entities: entityIds.size,
  dataFields: dataCatalog.records.length,
  screens: screenIds.size,
  traceabilityRows: traceability.records.length,
  apiOperations: operationIds.size,
  warnings: warnings.length,
  errors: errors.length,
};

if (warnings.length > 0) {
  console.warn("Avisos:");
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}
if (errors.length > 0) {
  console.error("Falhas de validação:");
  errors.forEach((error) => console.error(`- ${error}`));
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("Documentação validada com sucesso.");
console.log(JSON.stringify(summary, null, 2));
