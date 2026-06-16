/**
 * Split long text into overlapping chunks suitable for embedding.
 * Tries to break on paragraph/sentence boundaries to keep chunks coherent.
 */
export interface Chunk {
  index: number
  content: string
  tokenEstimate: number
}

const TARGET_CHARS = 1100
const OVERLAP_CHARS = 150

export function chunkText(raw: string): Chunk[] {
  const text = normalize(raw)
  if (!text) return []

  // Split into paragraphs first, then greedily pack into chunks.
  const paragraphs = text.split(/\n{2,}/)
  const chunks: string[] = []
  let current = ""

  const push = () => {
    const trimmed = current.trim()
    if (trimmed) chunks.push(trimmed)
    current = ""
  }

  for (const para of paragraphs) {
    if (para.length > TARGET_CHARS) {
      // Long paragraph: flush current, then hard-split by sentences/length.
      push()
      for (const piece of splitLong(para)) chunks.push(piece)
      continue
    }
    if ((current + "\n\n" + para).length > TARGET_CHARS) {
      push()
    }
    current = current ? current + "\n\n" + para : para
  }
  push()

  // Add overlap between consecutive chunks for retrieval continuity.
  const withOverlap = chunks.map((c, i) => {
    if (i === 0) return c
    const prev = chunks[i - 1]
    const tail = prev.slice(-OVERLAP_CHARS)
    return `${tail}\n\n${c}`
  })

  return withOverlap.map((content, index) => ({
    index,
    content,
    tokenEstimate: Math.ceil(content.length / 4),
  }))
}

function normalize(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function splitLong(para: string): string[] {
  const sentences = para.split(/(?<=[.!?])\s+/)
  const out: string[] = []
  let cur = ""
  for (const s of sentences) {
    if (s.length > TARGET_CHARS) {
      if (cur) {
        out.push(cur.trim())
        cur = ""
      }
      for (let i = 0; i < s.length; i += TARGET_CHARS) {
        out.push(s.slice(i, i + TARGET_CHARS))
      }
      continue
    }
    if ((cur + " " + s).length > TARGET_CHARS) {
      out.push(cur.trim())
      cur = s
    } else {
      cur = cur ? cur + " " + s : s
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}
