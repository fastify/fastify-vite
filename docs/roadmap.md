# Roadmap


<table class="roadmap">
<thead>
<tr>
<th>Next majors</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top">

<br>

<span class="release">

**`@fastify/vite@9.0.0`**

</span>

<br>

<small>

**Target date**

</small>

July 2025

</td>
<td valign="top">

Planned for this release:

- **Rewrite core in TypeScript**
- **Deprecate CJS support**
- **Revised HMR integration**

For a long time `@fastify/vite` resisted a TypeScript rewrite, staying true to Fastify's original JavaScript style, which to this date remains CJS written in the same form as seen in Node.js' own internal JavaScript libraries. 

The next major release of `@fastify/vite` will have a TypeScript core and will be compiled to ESM. This release will be coupled with a PR to Fastify itself supporting `import()` Promises in plugin registration calls. 

</td>
</tr>

</tbody>
</table>
