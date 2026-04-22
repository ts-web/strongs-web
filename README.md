# strongs-web

Static Next.js site deployed to GitHub Pages.

- Data source: `data/items.json`
- Home page: client-side filter/search over the full dataset
- Detail pages: SSG via `generateStaticParams` at `/items/[id]/`

## Local dev

```bash
npm install
npm run dev
```

## Build (static export)

```bash
npm run build
# output in ./out
```

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes `out/` to GitHub Pages.

After the first successful run, enable Pages in the repo settings → Pages → Source: **GitHub Actions**.
