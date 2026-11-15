# My Notes from Today

A static HTML blog with no framework or runtime dependency. The generated pages are already included, so the folder can be uploaded directly to a static host or pushed to a repository.

The design uses a text wordmark and an article-first editorial layout. The home page shows the eight newest notes. The notes archive has static numbered pages, while its separate search page searches and filters the full collection.

## Edit the blog

1. Edit `content/posts.json`. Each post needs a unique `slug`, `title`, ISO `date`, `topic`, `excerpt`, `readMinutes`, and `body` array. Body blocks use `p`, `h2`, or `blockquote` as their `type`.
2. Run `npm run build` (Node.js required). Commit or upload the generated HTML and XML files alongside `assets/`.
3. Replace the starter notes with your own writing before launch. The current pieces are sample editorial copy, not claims about products or personal experience.

The build creates the home page, paginated notes archive, full-archive search page, individual article pages, about and contact pages, RSS feed, sitemap, robots file, and a 404 page. Pagination works without JavaScript. Search and topic filters work in the browser without a service; all posts on the search page remain visible if JavaScript is disabled. Change `PAGE_SIZE` near the top of `build.mjs` to adjust the number of notes per page (currently 2 so pagination is visible with the starter notes).

The supplied CraftForms embed is installed on `contact/index.html`. It needs the remote CraftForms script and a live connection to that service. Other pages load no third-party scripts.

## CraftPages

This project is plain HTML, CSS, and JavaScript and can be used as a visual reference or uploaded as static files. If you edit a generated page directly in CraftPages, save that edited HTML separately: running the build again will replace generated pages. CraftPages account setup and publishing are not configured here.

## Preview and deploy

Run `python -m http.server 8000`, then open `http://localhost:8000/`. Upload the repository contents to any host that serves static files. Configure your host's custom domain and 404 setting for `mynotesfromtoday.com`.
