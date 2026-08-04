# Postman / Newman — pruebas de API

Scaffold para correr la colección con [Newman](https://github.com/postmanlabs/newman)
(CLI de Postman) contra el backend, local o desplegado.

## Uso

```bash
npm install -g newman   # o: npx newman ...
newman run jaumina-erp.postman_collection.json --env-var baseUrl=http://localhost:4001
```

Contra producción: `--env-var baseUrl=https://sistemaerpjaumina.onrender.com`.

## Estado

- `jaumina-erp.postman_collection.json`: smoke test de `/auth/login`.
- Carpeta "Facturación Electrónica" vacía a propósito — terreno preparado
  para cuando exista ese módulo en el backend (roadmap v2, ver
  `JAUMINA_WORKSPACE_RULES.md`). No se instaló `newman` como dependencia
  todavía porque no hay una suite real que correr en CI — agregarlo cuando
  esta colección crezca.
