# Ja'umina — Sistema de Gestión (ERP)

ERP de un solo usuario desarrollado para una clienta, con el diseño visual como prioridad inicial y una arquitectura de backend tradicional, sin proveedor BaaS.

## Mi rol

Desarrollo full-stack end-to-end: diseño del sistema visual (paleta, tipografía, componentes) antes de construir la lógica de negocio, y arquitectura de backend desde cero.

## Stack técnico

- Next.js (App Router) + TypeScript
- Prisma ORM + Neon (PostgreSQL serverless) — sin Supabase ni otro BaaS, de forma deliberada, como ejercicio de arquitectura de backend tradicional
- Autenticación validada explícitamente en cada endpoint (sin Row Level Security de base de datos)
- Contenedorizado con Docker

## Enfoque

A diferencia de otros proyectos, acá el diseño visual se definió primero (sistema de diseño y mockups estáticos) y recién después el esquema de datos y la lógica funcional.

## Buenas prácticas

- Escaneo de secretos configurado (gitleaks) para evitar credenciales commiteadas por error.
- Documentación de decisiones técnicas separada del código.

## Estado

En desarrollo activo.
