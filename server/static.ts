import express, { type Express } from "express";
import { resolveClientDir, resolveClientIndex, describeClientDirCandidates } from "./paths";

export function serveStatic(app: Express) {
  // Resolves to dist/public on Replit and public on Azure — see server/paths.ts.
  const publicPath = resolveClientDir();
  const indexPath = resolveClientIndex();

  if (!publicPath || !indexPath) {
    // Fail loudly at startup. Previously this pointed at a single hardcoded path,
    // and when that path was missing every route answered 404 with nothing in the
    // logs to explain why.
    throw new Error(
      `Built client not found. Looked in ${describeClientDirCandidates()}. ` +
        `Run \`npm run build\` before starting the server in production.`,
    );
  }

  app.use(express.static(publicPath));

  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}
