import { XXHash32 } from 'xxhash-addon'

const seed = Buffer.alloc(4, 0)

export function xxh32(input: string): string {
  const h = new XXHash32(seed)
  h.update(Buffer.from(input))
  return h.digest().toString('hex')
}
