# My Notes from Today

This is the local CraftPages project for mynotesfromtoday.com. CraftPages is the source of truth for the seven published posts and generated archive pages; the checked-in HTML is the static output that gets pushed.

## Edit posts

1. Open the **Blog** section in CraftPages and edit or add posts there.
2. Keep the post URL pattern at `/%postname%/`, the list address at `/blog/`, and posts per page at `10`.
3. In **Setup**, use `notes/a-place-for-the-in-between/index.html` as the post layout and `blog/index.html` as the list layout. The post layout maps the article, title, date, and category; the list maps the list, card fields, and pagination.
4. Use **Save and re-publish** in Blog settings to regenerate local files. This updates the local project only. Use **Publish site** only when you intend to send changes to the configured remote.
5. Preview the home page, `/blog/`, and a post in CraftPages before pushing.

The archive shows ten notes per page. With seven published posts, all seven appear together on `/blog/`. Edit shared styles in `assets/site.css`; the header and footer are shared across the site.

## Publish exclusions

CraftPages project exclusions are configured in `site.json`. A path listed there can be generated correctly in the local project and still be omitted from every publish. This is separate from redirects in `_redirects` and routing rules in `.htaccess`; neither file reveals a publish exclusion.

Before publishing a missing or stale page, check `site.json` for that exact path, especially `blog/index.html`. Remove any unintended exclusion, then publish and verify the report includes the file. Finally, open `/blog/index.html` directly and confirm it contains the newest posts. Do not treat “live site up to date” as proof that an excluded file was uploaded.

The `/blog/index.html` omission traced during the November 2026 archive work was caused by a `site.json` exclusion. The post generator and local archive were working; CraftPages correctly followed the exclusion and did not upload that page.

## Important

This is a plain-HTML CraftPages project. Do not run the old `build.mjs` generator: it uses an outdated three-post seed file and a different `/notes/` route scheme. The published CraftPages Blog data and its layouts are the active source.
