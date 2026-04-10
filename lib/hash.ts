const PRIME1 = 0x9e3779b1
const PRIME2 = 0x85ebca77
const PRIME3 = 0xc2b2ae3d
const PRIME4 = 0x27d4eb2f
const PRIME5 = 0x165667b1

function rotl(val: number, bits: number): number {
  return ((val << bits) | (val >>> (32 - bits))) >>> 0
}

function toUint32(n: number): number {
  return n >>> 0
}

export function xxh32(input: string): string {
  const buf = Buffer.from(input, 'utf8')
  const len = buf.length
  let h: number
  let i = 0

  if (len >= 16) {
    let v1 = toUint32(0 + PRIME1 + PRIME2)
    let v2 = toUint32(0 + PRIME2)
    let v3 = 0
    let v4 = toUint32(0 - PRIME1)
    const limit = len - 16

    while (i <= limit) {
      v1 = toUint32(Math.imul(rotl(toUint32(v1 + Math.imul(buf.readUInt32LE(i), PRIME2)), 13), PRIME1))
      i += 4
      v2 = toUint32(Math.imul(rotl(toUint32(v2 + Math.imul(buf.readUInt32LE(i), PRIME2)), 13), PRIME1))
      i += 4
      v3 = toUint32(Math.imul(rotl(toUint32(v3 + Math.imul(buf.readUInt32LE(i), PRIME2)), 13), PRIME1))
      i += 4
      v4 = toUint32(Math.imul(rotl(toUint32(v4 + Math.imul(buf.readUInt32LE(i), PRIME2)), 13), PRIME1))
      i += 4
    }

    h = toUint32(rotl(v1, 1) + rotl(v2, 7) + rotl(v3, 12) + rotl(v4, 18))
  } else {
    h = toUint32(0 + PRIME5)
  }

  h = toUint32(h + len)

  while (i <= len - 4) {
    h = toUint32(Math.imul(rotl(toUint32(h + Math.imul(buf.readUInt32LE(i), PRIME3)), 17), PRIME4))
    i += 4
  }

  while (i < len) {
    h = toUint32(Math.imul(rotl(toUint32(h + Math.imul(buf[i], PRIME5)), 11), PRIME1))
    i++
  }

  h = toUint32(Math.imul(h ^ (h >>> 15), PRIME2))
  h = toUint32(Math.imul(h ^ (h >>> 13), PRIME3))
  h = toUint32(h ^ (h >>> 16))

  return h.toString(16).padStart(8, '0')
}
