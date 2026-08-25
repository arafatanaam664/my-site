export type VerifiedImage = {
  mimeType: "image/avif" | "image/webp" | "image/jpeg" | "image/png";
  extension: "avif" | "webp" | "jpg" | "png";
  width: number;
  height: number;
};

const MAX_DIMENSION = 20_000;

function readU16BE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readU16LE(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readU32BE(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] * 0x1000000) + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]));
}

function readU24LE(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function validDimensions(width: number, height: number) {
  return Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0 && width <= MAX_DIMENSION && height <= MAX_DIMENSION;
}

function isPng(bytes: Uint8Array): VerifiedImage | null {
  if (bytes.length < 24 || ![137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return null;
  if (String.fromCharCode(...bytes.slice(12, 16)) !== "IHDR") return null;
  const width = readU32BE(bytes, 16);
  const height = readU32BE(bytes, 20);
  return validDimensions(width, height) ? { mimeType: "image/png", extension: "png", width, height } : null;
}

function isJpeg(bytes: Uint8Array): VerifiedImage | null {
  if (bytes.length < 10 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let cursor = 2;
  while (cursor + 9 < bytes.length) {
    if (bytes[cursor] !== 0xff) return null;
    while (bytes[cursor] === 0xff) cursor += 1;
    const marker = bytes[cursor];
    cursor += 1;
    if (marker === 0xd9 || marker === 0xda) return null;
    if (cursor + 1 >= bytes.length) return null;
    const segmentLength = readU16BE(bytes, cursor);
    if (segmentLength < 2 || cursor + segmentLength > bytes.length) return null;
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      const height = readU16BE(bytes, cursor + 3);
      const width = readU16BE(bytes, cursor + 5);
      return validDimensions(width, height) ? { mimeType: "image/jpeg", extension: "jpg", width, height } : null;
    }
    cursor += segmentLength;
  }
  return null;
}

function isWebp(bytes: Uint8Array): VerifiedImage | null {
  if (bytes.length < 30 || String.fromCharCode(...bytes.slice(0, 4)) !== "RIFF" || String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP") return null;
  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  let width = 0;
  let height = 0;
  if (chunk === "VP8 ") {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    width = readU16LE(bytes, 26) & 0x3fff;
    height = readU16LE(bytes, 28) & 0x3fff;
  } else if (chunk === "VP8L") {
    if (bytes[20] !== 0x2f || bytes.length < 25) return null;
    width = 1 + bytes[21] + ((bytes[22] & 0x3f) << 8);
    height = 1 + ((bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10));
  } else if (chunk === "VP8X") {
    width = 1 + readU24LE(bytes, 24);
    height = 1 + readU24LE(bytes, 27);
  } else return null;
  return validDimensions(width, height) ? { mimeType: "image/webp", extension: "webp", width, height } : null;
}

function isAvif(bytes: Uint8Array): VerifiedImage | null {
  if (bytes.length < 32 || String.fromCharCode(...bytes.slice(4, 8)) !== "ftyp") return null;
  const brands = String.fromCharCode(...bytes.slice(8, Math.min(bytes.length, 64)));
  if (!brands.includes("avif") && !brands.includes("avis")) return null;
  const limit = Math.min(bytes.length - 16, 128 * 1024);
  for (let index = 16; index < limit; index += 1) {
    if (String.fromCharCode(...bytes.slice(index, index + 4)) !== "ispe") continue;
    const width = readU32BE(bytes, index + 8);
    const height = readU32BE(bytes, index + 12);
    if (validDimensions(width, height)) return { mimeType: "image/avif", extension: "avif", width, height };
  }
  return null;
}

export function inspectSupportedImage(bytes: Uint8Array): VerifiedImage | null {
  return isPng(bytes) ?? isJpeg(bytes) ?? isWebp(bytes) ?? isAvif(bytes);
}

export async function sha256Hex(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function sanitizeAltText(value: FormDataEntryValue | null) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}
