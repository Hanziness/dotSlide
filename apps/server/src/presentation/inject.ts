/**
 * Script tag injected into served HTML pages to connect
 * the presentation to the dotslide control server.
 */
export const INJECT_SCRIPT = `
<script type="module">
  import { connectToServer } from "/@dotslide/remote-client.js";
  connectToServer(window.location.origin, {
    autoReconnect: true,
    captureSlides: true,
  });
</script>`;
