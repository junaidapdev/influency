# backend/ — InsForge artifacts

This folder is **not** a Node/pnpm workspace package. It holds the things we own on the InsForge
backend, managed through the **InsForge CLI** (`npx @insforge/cli ...`):

```
functions/    # Deno edge functions (e.g. mark-payment-received, extract-snap-report)
migrations/   # SQL migrations — tables, RLS policies, indexes, Postgres functions (RPC)
config/       # env.ts — Deno env reader (read each secret once; never scatter Deno.env.get)
insforge.toml # config-as-code: auth, storage limits, SMTP, retention (apply with `config apply`)
```

## Conventions (see /context/02 + /context/03)
- **Tenant isolation = Postgres RLS.** Every app table ships with `user_id = auth.uid()` policies in
  the same migration that creates it. RLS is the security; client filters are convenience only.
- **One response envelope** for every edge function: `ok(data)` / `fail(code, message)` from
  `@influency/shared` (imported by relative `.ts` path from Deno).
- **Atomic multi-row writes** run inside a Postgres function (RPC) called from the edge function.
- **Secrets** live in InsForge secret config, surfaced through `config/env.ts`. Never committed.

## Workflow
```bash
npx @insforge/cli login
npx @insforge/cli link --project-id <project-id>
npx @insforge/cli metadata                 # inspect live tables/auth/storage/functions
npx @insforge/cli db migrations new <name> # author a migration
npx @insforge/cli db migrations up --all   # apply
npx @insforge/cli config plan && npx @insforge/cli config apply
```

> Always confirm the live InsForge API via the CLI docs (`npx @insforge/cli docs <topic> <lang>`)
> — or the InsForge MCP `fetch-docs` tool if connected — before writing backend code.
