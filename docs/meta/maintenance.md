# Maintenance

This section is mostly a checklist for myself but hopefully it can be tweaked to accomodate the presence of more contributors in the near future.

Up until the 2.2.0 release, <b>fastify-vite</b> had essentially no proper release management, with no clear guidelines set. Also early adopters ended up using forked versions of their own to address random issues that were present in the first releases.

Moving forward (as of November 5, 2021), these are the general maintenance guidelines:

- Keep versioning synchronised between <b>fastify-vite</b> and renderer adapters.
- Do one **minor** release at the turn of every month.
  - Starting with 2.2.0, which was released on November 5, 2021.
- Do as many **patch** releases as time allows with hotfixes for any issues uncovered.
- Check open bug reports, both on GitHub and on Fastify's and Vite's Discord servers.
- Check Vite, Vue and React latest releases, breaking changes etc.
  - Update `peerDependencies` when needed.
- Increase test coverage for all documented features (main goal for **2.3.0**)
- Keep a central list of TODO items in the repo as `TODO.md`

There's no automated release script, `package.json` files still need to be manually edited and `npm publish` needs to be manually executed to push a new release out.