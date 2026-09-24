# bronwyn_birthday_26

React + Vite app, set up to deploy to GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

Then open the URL Vite prints.

## GitHub Pages

The site is published at:

https://bronwynsbirthday.com/

`public/CNAME` keeps that custom domain attached on each deploy. DNS for the domain points at GitHub Pages, and **Settings → Pages** uses GitHub Actions as the source.

Pushes to `main` rebuild and publish automatically.
