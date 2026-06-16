"use client"

/* Lightweight in-browser code runners. Heavy runtimes (Pyodide, sql.js) are
   loaded from CDN on first use and cached on window. */

export type SandboxLang = "python" | "javascript" | "sql" | "cpp" | "c"

export interface RunResult {
  output: string
  error?: string
}

type Win = typeof window & {
  __pyodide?: unknown
  loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideLike>
  initSqlJs?: (opts: { locateFile: (f: string) => string }) => Promise<SqlJsLike>
  __sqlJs?: SqlJsLike
}

interface PyodideLike {
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (o: { batched: (s: string) => void }) => void
  setStderr: (o: { batched: (s: string) => void }) => void
}

interface SqlJsLike {
  Database: new () => {
    exec: (sql: string) => { columns: string[]; values: unknown[][] }[]
  }
}

const PYODIDE_VERSION = "v0.26.4"
const SQLJS_VERSION = "1.12.0"

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement("script")
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Impossibile caricare ${src}`))
    document.head.appendChild(s)
  })
}

async function getPyodide(): Promise<PyodideLike> {
  const w = window as Win
  if (w.__pyodide) return w.__pyodide as PyodideLike
  const base = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`
  await injectScript(`${base}pyodide.js`)
  const py = await w.loadPyodide!({ indexURL: base })
  w.__pyodide = py
  return py
}

async function runPython(code: string): Promise<RunResult> {
  const py = await getPyodide()
  let out = ""
  py.setStdout({ batched: (s) => (out += s + "\n") })
  py.setStderr({ batched: (s) => (out += s + "\n") })
  try {
    await py.runPythonAsync(code)
    return { output: out.trimEnd() || "(nessun output)" }
  } catch (e) {
    return { output: out.trimEnd(), error: String(e) }
  }
}

async function getSqlJs(): Promise<SqlJsLike> {
  const w = window as Win
  if (w.__sqlJs) return w.__sqlJs
  const base = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQLJS_VERSION}/`
  await injectScript(`${base}sql-wasm.js`)
  const SQL = await w.initSqlJs!({ locateFile: (f) => `${base}${f}` })
  w.__sqlJs = SQL
  return SQL
}

async function runSql(code: string): Promise<RunResult> {
  try {
    const SQL = await getSqlJs()
    const db = new SQL.Database()
    const results = db.exec(code)
    if (results.length === 0) return { output: "Query eseguita (nessun risultato)." }
    const blocks = results.map((r) => {
      const header = r.columns.join(" | ")
      const sep = r.columns.map(() => "---").join(" | ")
      const rows = r.values.map((row) => row.map(String).join(" | "))
      return [header, sep, ...rows].join("\n")
    })
    return { output: blocks.join("\n\n") }
  } catch (e) {
    return { output: "", error: String(e) }
  }
}

async function runJavascript(code: string): Promise<RunResult> {
  const logs: string[] = []
  const original = console.log
  console.log = (...args: unknown[]) =>
    logs.push(args.map((a) => formatValue(a)).join(" "))
  try {
    const fn = new Function(`return (async () => { ${code} })()`)
    const result = await fn()
    if (result !== undefined) logs.push(formatValue(result))
    return { output: logs.join("\n") || "(nessun output)" }
  } catch (e) {
    return { output: logs.join("\n"), error: String(e) }
  } finally {
    console.log = original
  }
}

function formatValue(v: unknown): string {
  if (typeof v === "string") return v
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

export async function runCode(
  lang: SandboxLang,
  code: string,
): Promise<RunResult> {
  switch (lang) {
    case "python":
      return runPython(code)
    case "javascript":
      return runJavascript(code)
    case "sql":
      return runSql(code)
    default:
      return {
        output: "",
        error:
          "L'esecuzione di C/C++ nel browser non è ancora supportata. Puoi comunque scrivere e copiare il codice.",
      }
  }
}

export const RUNNABLE: SandboxLang[] = ["python", "javascript", "sql"]
