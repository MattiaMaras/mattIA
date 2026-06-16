/** Serialize a number[] to the pgvector text literal format: "[1,2,3]". */
export function toVectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`
}
