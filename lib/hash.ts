import xxhashWasm from 'xxhash-wasm'

const hasherPromise = xxhashWasm()
let hasher: Awaited<ReturnType<typeof xxhashWasm>> | null = null

hasherPromise.then((h) => { hasher = h })

export function xxh32(input: string): string {
  if (!hasher) {
    let h = 0
    for (let i = 0; i < input.length; i++) {
      h = ((h << 5) - h + input.charCodeAt(i)) | 0
    }
    return (h >>> 0).toString(16).padStart(8, '0')
  }
  return hasher.h32(input).toString(16).padStart(8, '0')
}
