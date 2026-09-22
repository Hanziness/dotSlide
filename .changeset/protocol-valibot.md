---
"@dotslide/protocol": major
---

Migrate all schemas from zod to valibot. Validation schemas are now valibot schemas — use `v.safeParse(Schema, data)` / `v.parse(Schema, data)` instead of the former static `.safeParse()`/`.parse()` methods. Result objects are `{ output, issues }` instead of `{ data, error }`. Type extraction uses `v.InferOutput<T>`. `NavigationType`, `deriveNavigationState`, and all hand-written types are unchanged.
