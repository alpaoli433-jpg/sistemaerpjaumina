import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del workspace en esta carpeta: el package.json de nivel
  // monorepo (erp-distribuidora/package.json, agregado para dependency-cruiser)
  // hace que Next.js/Turbopack no puedan inferirla solos.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
