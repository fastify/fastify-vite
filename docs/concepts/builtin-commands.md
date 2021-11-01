# Built-in Commands

Any <b>fastify-vite</b> application will recognize the following commands:

<table class="infotable"><tr><td style="width: 20%; vertical-align: top;">
<code class="h inline-block">node &lt;app&gt; <b>build</b></code></td>
<td>
Builds the Vite application (creates a bundle).
</td></tr><tr><td style="vertical-align: top;">
<code class="h inline-block">node &lt;app&gt; <b>generate</b></code></td>
<td>
Builds the Vite application (creates a bundle) <b>with prerendered pages</b>.
<br><br>See <a href="">Static Generation</a> for more details.
</td></tr><tr><td style="vertical-align: top;">
<code class="h inline-block">node &lt;app&gt; <b>generate-server</b></code></td>
<td>
Builds the Vite application (creates a bundle) <b>with prerendered pages</b>.
<br><br><b>Also starts a Fastify server that accepts API requests to trigger static generation of pages on demand</b>.
<br><br>See <a href="">Generate Server</a> for more details.
</td></tr></table>

