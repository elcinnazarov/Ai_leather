import express from "express";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // ✅ Proxy: Bütün /api sorğularını Java Backend-inə yönləndirir
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    })
  );

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend running on http://localhost:${PORT}`);
    console.log(`API proxied to http://localhost:8080`);
  });
}
startServer();
