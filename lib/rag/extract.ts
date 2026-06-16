import "server-only"
import { extractText, getDocumentProxy } from "unpdf"

export type FileKind = "pdf" | "text" | "image" | "unknown"

export function classifyMime(mimeType: string, filename: string): FileKind {
  const m = mimeType.toLowerCase()
  const name = filename.toLowerCase()
  if (m === "application/pdf" || name.endsWith(".pdf")) return "pdf"
  if (m.startsWith("image/")) return "image"
  if (
    m.startsWith("text/") ||
    m === "application/json" ||
    /\.(txt|md|markdown|csv|tex|json)$/.test(name)
  )
    return "text"
  return "unknown"
}

/** Extract plain text from a PDF buffer using unpdf (pdf.js, serverless-safe). */
export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

export function decodeText(buffer: ArrayBuffer): string {
  return new TextDecoder("utf-8").decode(buffer)
}
