# GitHub Copilot Instructions

> **Full instructions are in [/.instructions.md](/.instructions.md) — read that file first.**

This file is the standard Copilot entry point. All project context, rules, and workflows are consolidated in `.instructions.md` at the repository root.

---

## Quick Reference

### Deployment Rule ⚠️
**Never run `wrangler deploy` or publish directly to Cloudflare.**
Commit to git → Cloudflare automatically deploys. That's the only deployment path.

### After Every Change
```bash
npm run build        # Must succeed
npm start            # Verify at http://localhost:4000
```

### Git Workflow
```bash
git checkout -b feature/your-feature-name
# make changes, then verify:
npm run build
git add .
git commit -m "Clear description of changes"
git push origin feature/your-feature-name
```

### Key Locations
| What | Where |
|------|-------|
| Blog posts | `source/_posts/*.md` |
| Landing pages | `source/l/<slug>/index.html` |
| Layouts / partials | `themes/mdfrossard/` |
| Global data | `source/_data/` |
| Worker entry point | `src/worker.js` |
| Eleventy config | `.eleventy.js` |
| Cloudflare config | `wrangler.toml` |
| Generated output | `public/` ← **never edit directly** |

---

**See [/.instructions.md](/.instructions.md) for complete documentation.**
