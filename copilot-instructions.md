# GitHub Copilot Instructions

**⚠️ PRIMARY REFERENCE: See [.instructions.md](.instructions.md) for complete instructions**

This file is a quick reference. For comprehensive information about building, running, Git workflow, project structure, and troubleshooting, please refer to [.instructions.md](.instructions.md).

---

## Essential Quick Reference

### The Golden Rule
**After EVERY change without exception:**
```bash
npm run build              # Build site to public/
npm run start:eleventy     # Eleventy dev server (fast, watches files)
npm run start              # Build then run Cloudflare Pages dev (includes Functions)
# Test at http://localhost:4000 in browser
```

### Core Commands
```bash
npm run build              # Build entire site to public/
npm run build:app          # Build site only (quick)
npm run start:eleventy     # Eleventy --serve (fast local iteration)
npm run start:cloudflare   # Wrangler pages dev (serve public/ + Functions)
npm run start              # Build then run Cloudflare Pages dev
```

### Verification Steps
1. Run `npm run build` → must succeed
2. Run `npm run start:eleventy` for template/content iteration, or `npm run start` / `npm run start:cloudflare` to test Cloudflare Functions locally → must start server
3. Open http://localhost:4000 → must load
4. Check modified pages render correctly
5. Check browser console (F12) for errors

### Git Workflow (You Can Execute)
```bash
git checkout -b feature/your-feature-name
# Make changes
npm run build && npm run start:cloudflare  # VERIFY here (Cloudflare Functions)
git add .
git commit -m "Clear description of changes"
git push origin feature/your-feature-name
```

### Key File Locations
- **Posts:** `source/_posts/*.md` (edit freely)
- **Drafts:** `source/_drafts/*.md` — Eleventy may include drafts by default; to exclude add `source/_drafts` to `.eleventyignore` or set `published: false` in front matter.
- **Config:** `_config.yml` (careful!)
- **Data:** `source/_data/*.json` (testimonials, authors)
- **Theme:** `themes/mdfrossard/` (be careful!)
- **DO NOT EDIT:** `public/` (auto-generated)

### Cloudflare Functions / Email
- The project uses Cloudflare Pages Functions in `functions/` (for example the contact handler).
- Ensure production env vars are set in Cloudflare Pages: `SPARKPOST_SECRET`, `CONTACT_EMAIL`, `SITE_EMAIL_FROM` (optional).

### Critical Rules
1. ✅ Verify after every change
2. ✅ Use Portuguese (pt_BR) for content
3. ✅ Clear commit messages
4. ⛔ Never edit `public/` directory
5. ⛔ Don't skip verification step

---

## For Complete Information

**ALL detailed instructions are in [.instructions.md](.instructions.md)**

Refer there for:
- ✓ Full project overview and context
- ✓ Detailed build/verification process
- ✓ Extended troubleshooting guide
- ✓ Project structure details
- ✓ Content guidelines
- ✓ Common tasks with examples
- ✓ Testing checklist
- ✓ Cloudflare Pages Functions information
