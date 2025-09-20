import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function serveStatic(app: Express) {
  // In production, the server is in the root and public folder is alongside it
  const publicPath = path.resolve(__dirname, "./public");
  const indexPath = path.join(publicPath, "index.html");

  app.use(express.static(publicPath));

  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}