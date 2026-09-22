---
"@dotslide/framework": minor
---

Framework bundle shrinks from 100.7 KB raw / 27.2 KB gzip to 35.8 KB raw / 10.5 KB gzip by consuming `@dotslide/protocol`'s valibot schemas instead of zod's. The dist remains fully self-contained (no import map needed). `peerDependencies.zod` removed — consumers extending protocol schemas install valibot themselves.
