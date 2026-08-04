/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    // El backend no usa path aliases (solo imports relativos), así que no
    // hace falta resolver tsConfig acá — evita problemas de resolución de
    // "include" de TypeScript al correr desde la raíz del monorepo.
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
