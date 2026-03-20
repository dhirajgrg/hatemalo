/**
 * ImageKit URL transformation utility.
 * Appends tr= parameters to ImageKit URLs for on-the-fly optimization.
 * Non-ImageKit URLs are returned unchanged.
 */

const IMAGEKIT_DOMAIN = "ik.imagekit.io";

export function optimizeImage(url, { width, height, quality = 80, blur } = {}) {
  if (!url || !url.includes(IMAGEKIT_DOMAIN)) return url;

  const transforms = [`f-auto`, `q-${quality}`];
  if (width) transforms.push(`w-${width}`);
  if (height) transforms.push(`h-${height}`);
  if (blur) transforms.push(`bl-${blur}`);

  const tr = `tr:${transforms.join(",")}`;

  // Insert transformation before the file path
  // URL format: https://ik.imagekit.io/<id>/path/to/file
  // Transformed: https://ik.imagekit.io/<id>/tr:w-400,q-80/path/to/file
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    // pathParts[0] = endpoint id, rest = file path
    if (pathParts.length >= 2) {
      const endpointId = pathParts[0];
      const filePath = pathParts.slice(1).join("/");
      parsed.pathname = `/${endpointId}/${tr}/${filePath}`;
      return parsed.toString();
    }
  } catch {
    // fallback: append as query param
  }

  return url;
}

// Preset sizes for common use cases
export const imagePresets = {
  thumbnail: { width: 400, height: 300, quality: 75 },
  card: { width: 600, height: 450, quality: 80 },
  detail: { width: 1200, quality: 85 },
  detailThumb: { width: 120, height: 120, quality: 70 },
  avatar: { width: 100, height: 100, quality: 80 },
  avatarLarge: { width: 200, height: 200, quality: 85 },
  placeholder: { width: 40, height: 30, quality: 10, blur: 10 },
};
