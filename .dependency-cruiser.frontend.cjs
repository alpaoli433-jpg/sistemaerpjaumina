/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    // Ruta relativa al cwd en el que corre depcruise (dentro de
    // erp-cocteleria-frontend/, ver el script "graph:frontend" en el
    // package.json raíz) — necesario para resolver el alias "@/*".
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    exclude: { path: 'node_modules' },
    doNotFollow: { path: 'node_modules' },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
    },
  },
};
