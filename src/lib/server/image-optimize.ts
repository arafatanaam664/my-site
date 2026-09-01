import type { VerifiedImage } from "./image-validation";

export const DISCOVER_MIN_WIDTH = 1200;
export const WEB_MAX_EDGE = 1920;
export const WEBP_QUALITY = 84;

export function targetDimensions(width: number, height: number, maxEdge = WEB_MAX_EDGE) {
  const edge = Math.max(width, height);
  if (edge <= maxEdge) return { width, height };
  const scale = maxEdge / edge;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function discoverImageReady(width: number, height: number) {
  return width >= DISCOVER_MIN_WIDTH && width * height >= 300_000 && height >= 160;
}

function asArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function wasmModule(loaded: unknown) {
  const record = loaded as { default?: WebAssembly.Module };
  return (record.default ?? loaded) as never;
}

async function decodeRaster(bytes: Uint8Array, mimeType: VerifiedImage["mimeType"]): Promise<ImageData | null> {
  const buffer = asArrayBuffer(bytes);
  try {
    if (mimeType === "image/jpeg") {
      const codec = await import("@jsquash/jpeg/decode");
      await codec.init(wasmModule(await import("@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm")));
      return await codec.default(buffer);
    }
    if (mimeType === "image/png") {
      const codec = await import("@jsquash/png/decode");
      await codec.init(wasmModule(await import("@jsquash/png/codec/pkg/squoosh_png_bg.wasm")));
      return await codec.default(buffer);
    }
    if (mimeType === "image/webp") {
      const codec = await import("@jsquash/webp/decode");
      await codec.init(wasmModule(await import("@jsquash/webp/codec/dec/webp_dec.wasm")));
      return await codec.default(buffer);
    }
  } catch {
    return null;
  }
  return null;
}

async function encodeWebp(raster: ImageData, width: number, height: number) {
  let frame = raster;
  if (raster.width !== width || raster.height !== height) {
    const resize = await import("@jsquash/resize");
    await resize.initResize(wasmModule(await import("@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm")));
    frame = await resize.default(raster, { width, height });
  }
  const codec = await import("@jsquash/webp/encode");
  await codec.init(wasmModule(await import("@jsquash/webp/codec/enc/webp_enc.wasm")));
  const encoded = await codec.default(frame, { quality: WEBP_QUALITY });
  return new Uint8Array(encoded);
}

export type OptimizedImage = VerifiedImage & {
  bytes: Uint8Array;
  note: "webp_optimized" | "original_kept" | "avif_kept";
};

export async function optimizeImageForWeb(bytes: Uint8Array, source: VerifiedImage): Promise<OptimizedImage> {
  if (source.mimeType === "image/avif") return { ...source, bytes, note: "avif_kept" };
  const size = targetDimensions(source.width, source.height);
  try {
    const raster = await decodeRaster(bytes, source.mimeType);
    if (!raster) return { ...source, bytes, note: "original_kept" };
    const webp = await encodeWebp(raster, size.width, size.height);
    if (!webp.byteLength) return { ...source, bytes, note: "original_kept" };
    if (source.mimeType === "image/webp" && size.width === source.width && webp.byteLength >= bytes.byteLength) {
      return { ...source, bytes, note: "original_kept" };
    }
    return { mimeType: "image/webp", extension: "webp", width: size.width, height: size.height, bytes: webp, note: "webp_optimized" };
  } catch {
    return { ...source, bytes, note: "original_kept" };
  }
}

export function processingCopy(result: OptimizedImage) {
  if (result.note === "webp_optimized") {
    return discoverImageReady(result.width, result.height)
      ? "ضُغطت الصورة إلى WebP مع الإبقاء على عرض مناسب لاقتراحات جوجل."
      : "ضُغطت الصورة إلى WebP. لعروض جوجل الكبيرة يُفضَّل عرض 1200 بكسل على الأقل.";
  }
  if (result.note === "avif_kept") return "أُبقيت صورة AVIF كما هي لأنها مضغوطة مسبقًا.";
  return "حُفظ الأصل لأن التحويل إلى WebP لم يتوفر في وقت التشغيل.";
}
