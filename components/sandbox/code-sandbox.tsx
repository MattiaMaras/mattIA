"use client"

import * as React from "react"
import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { Play, Loader2, Trash2, TerminalSquare } from "lucide-react"
import { runCode, RUNNABLE, type SandboxLang } from "@/lib/sandbox/runners"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const LANGS: { id: SandboxLang; label: string; monaco: string }[] = [
  { id: "python", label: "Python", monaco: "python" },
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "sql", label: "SQL", monaco: "sql" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "c", label: "C", monaco: "c" },
]

const STARTERS: Record<SandboxLang, string> = {
  python: 'print("Ciao da Python!")\nfor i in range(3):\n    print(i)',
  javascript: 'console.log("Ciao da JS!")\n[1,2,3].forEach(n => console.log(n*n))',
  sql: "CREATE TABLE studenti(nome TEXT, voto INT);\nINSERT INTO studenti VALUES ('Mario', 28), ('Lucia', 30);\nSELECT * FROM studenti ORDER BY voto DESC;",
  cpp: '#include <iostream>\nint main() {\n    std::cout << "Ciao C++";\n    return 0;\n}',
  c: '#include <stdio.h>\nint main() {\n    printf("Ciao C");\n    return 0;\n}',
}

export default function CodeSandbox({
  initialLang = "python",
  initialCode,
}: {
  initialLang?: SandboxLang
  initialCode?: string
}) {
  const { resolvedTheme } = useTheme()
  const [lang, setLang] = React.useState<SandboxLang>(initialLang)
  const [code, setCode] = React.useState(initialCode ?? STARTERS[initialLang])
  const [output, setOutput] = React.useState<string>("")
  const [error, setError] = React.useState<string | undefined>()
  const [running, setRunning] = React.useState(false)

  const monacoLang = LANGS.find((l) => l.id === lang)?.monaco ?? "plaintext"
  const canRun = RUNNABLE.includes(lang)

  function changeLang(next: SandboxLang) {
    setLang(next)
    // Load a starter only if the editor is empty or untouched.
    setCode((c) => (c.trim() === "" || isStarter(c) ? STARTERS[next] : c))
    setOutput("")
    setError(undefined)
  }

  async function run() {
    setRunning(true)
    setError(undefined)
    setOutput("")
    try {
      const res = await runCode(lang, code)
      setOutput(res.output)
      setError(res.error)
    } catch (e) {
      setError(String(e))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/60 px-2 py-1.5">
        <Select value={lang} onValueChange={(v) => v && changeLang(v as SandboxLang)}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGS.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setOutput("")
              setError(undefined)
            }}
            title="Pulisci output"
            aria-label="Pulisci output"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button size="sm" onClick={run} disabled={running || !canRun}>
            {running ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            Esegui
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language={monacoLang}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          loading={
            <div className="grid h-full place-items-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Output console */}
      <div className="h-2/5 min-h-[120px] shrink-0 border-t border-border/60 bg-muted/30">
        <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
          <TerminalSquare className="size-3.5" />
          Output
        </div>
        <div className="h-[calc(100%-2rem)] overflow-auto p-3 font-mono text-xs">
          {!canRun && (
            <p className="text-amber-600 dark:text-amber-500">
              L&apos;esecuzione di {lang.toUpperCase()} nel browser non è
              supportata. Puoi scrivere e copiare il codice.
            </p>
          )}
          {error && (
            <pre className="whitespace-pre-wrap text-destructive">{error}</pre>
          )}
          {output && <pre className="whitespace-pre-wrap">{output}</pre>}
          {canRun && !output && !error && !running && (
            <p className="text-muted-foreground">
              Premi «Esegui» per eseguire il codice. Il primo avvio di
              Python/SQL scarica il runtime.
            </p>
          )}
          {running && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Esecuzione…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function isStarter(code: string): boolean {
  return Object.values(STARTERS).some((s) => s === code)
}
