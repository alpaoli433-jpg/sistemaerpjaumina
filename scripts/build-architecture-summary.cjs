#!/usr/bin/env node
/**
 * Resume los dumps crudos de dependency-cruiser (.graph/architecture-map.
 * {backend,frontend}.json, muy verbosos: un objeto por archivo) en un único
 * .graph/architecture-map.json agrupado por carpeta/módulo — pensado para
 * que una sesión de IA lo lea primero y entienda la arquitectura sin abrir
 * cada archivo fuente.
 */
const fs = require('fs');
const path = require('path');

const GRAPH_DIR = path.join(__dirname, '..', '.graph');

function moduleGroupOf(sourcePath) {
  // "src/modules/clientes/clientes.service.ts" -> "src/modules/clientes"
  // "src/app/(app)/dashboard/page.tsx"          -> "src/app/(app)/dashboard"
  // "src/lib/api.ts"                            -> "src/lib"
  const parts = sourcePath.split('/');
  parts.pop();
  return parts.join('/') || '.';
}

function summarizeApp(rawJsonPath) {
  const raw = JSON.parse(fs.readFileSync(rawJsonPath, 'utf8'));
  const groups = new Map();

  for (const mod of raw.modules) {
    const group = moduleGroupOf(mod.source);
    if (!groups.has(group)) {
      groups.set(group, { files: [], dependsOn: new Set() });
    }
    const entry = groups.get(group);
    entry.files.push(path.basename(mod.source));

    for (const dep of mod.dependencies) {
      if (!dep.resolved || dep.couldNotResolve) continue;
      const depGroup = moduleGroupOf(dep.resolved);
      if (depGroup !== group) {
        entry.dependsOn.add(depGroup);
      }
    }
  }

  const modules = Object.fromEntries(
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, { files, dependsOn }]) => [
        group,
        {
          fileCount: files.length,
          files: files.sort(),
          dependsOn: [...dependsOn].sort(),
        },
      ]),
  );

  return {
    totalFiles: raw.modules.length,
    totalGroups: groups.size,
    modules,
  };
}

function main() {
  const backend = summarizeApp(path.join(GRAPH_DIR, 'architecture-map.backend.json'));
  const frontend = summarizeApp(path.join(GRAPH_DIR, 'architecture-map.frontend.json'));

  const summary = {
    generatedAt: new Date().toISOString(),
    howToRegenerate: 'npm run graph:generate (desde la raíz del repo)',
    note:
      'Mapa agrupado por carpeta (no por archivo individual) para lectura rápida. ' +
      'Los dumps completos archivo-por-archivo están en architecture-map.{backend,frontend}.json.',
    backend: { root: 'backend/src', ...backend },
    frontend: { root: 'erp-cocteleria-frontend/src', ...frontend },
  };

  fs.writeFileSync(
    path.join(GRAPH_DIR, 'architecture-map.json'),
    JSON.stringify(summary, null, 2) + '\n',
  );

  console.log(
    `architecture-map.json generado: backend ${backend.totalGroups} módulos (${backend.totalFiles} archivos), ` +
      `frontend ${frontend.totalGroups} módulos (${frontend.totalFiles} archivos).`,
  );
}

main();
