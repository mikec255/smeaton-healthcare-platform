import fs from "fs";
import path from "path";

/**
 * The built client ends up in a different place depending on where the app runs:
 *
 *   - Replit / a local `npm run build`: vite writes to  <cwd>/dist/public
 *   - The Azure deploy layout:          the bundle lands at <cwd>/public
 *
 * Hardcoding either one silently breaks the other — a wrong path here shows up as
 * blanket 404s (static serving) or as missing share-preview tags (OG injection),
 * neither of which points at the real cause. Resolve whichever actually exists so
 * one build behaves the same on both.
 *
 * Set CLIENT_DIR to pin the directory explicitly (path relative to cwd, or absolute).
 * Do that on any host where both layouts could be present, so the choice is a
 * deployment decision rather than a coin flip on directory ordering.
 */
const CANDIDATE_DIRS = ["dist/public", "public"];

function toAbs(rel: string): string {
  return path.isAbsolute(rel) ? rel : path.join(process.cwd(), ...rel.split("/"));
}

function hasIndex(dir: string): boolean {
  return fs.existsSync(path.join(dir, "index.html"));
}

let cached: string | null | undefined;

/**
 * Resolved once per process. Both callers (static serving and OG injection) then
 * agree on the same directory for the lifetime of the process, instead of each
 * re-probing the filesystem and potentially disagreeing.
 */
export function resolveClientDir(): string | null {
  if (cached !== undefined) return cached;

  const override = process.env.CLIENT_DIR?.trim();
  if (override) {
    const dir = toAbs(override);
    if (!hasIndex(dir)) {
      throw new Error(
        `CLIENT_DIR is set to "${override}" (resolved to ${dir}) but no index.html was found there.`,
      );
    }
    cached = dir;
    return cached;
  }

  const found = CANDIDATE_DIRS.map(toAbs).filter(hasIndex);

  if (found.length > 1) {
    // Ambiguous: a leftover build from the other layout can shadow the one the host
    // actually intended to ship. Don't crash a live deployment over it, but make the
    // choice visible so it isn't diagnosed as a caching or stale-build problem.
    console.warn(
      `[paths] Multiple client builds found: ${found.join(", ")}. Using ${found[0]}. ` +
        `Set CLIENT_DIR to pin this explicitly.`,
    );
  }

  cached = found[0] ?? null;
  return cached;
}

export function resolveClientIndex(): string | null {
  const dir = resolveClientDir();
  return dir ? path.join(dir, "index.html") : null;
}

/** Human-readable list of the places we looked, for error messages. */
export function describeClientDirCandidates(): string {
  return CANDIDATE_DIRS.map(toAbs).join(" or ");
}
