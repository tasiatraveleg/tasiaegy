/**
 * Client-side Cloudinary helpers.
 *
 * Uses an UNSIGNED upload preset so the dashboard can upload directly from
 * the browser without exposing your API secret. Create an unsigned preset
 * in Cloudinary → Settings → Upload → Upload presets, then set:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 * in your .env.local (see .env.local.example).
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a single File (image or video) to Cloudinary.
 * @param {File} file
 * @param {"programs"|"gallery"} [folder]
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<{secure_url: string, public_id: string, resource_type: "image"|"video"|"raw", width?: number, height?: number, format?: string}>}
 */
export async function uploadToCloudinary(file, folder = "gallery", onProgress) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local."
    );
  }

  const resourceType = file.type.startsWith("video") ? "video" : "image";
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `tasia/${folder}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Cloudinary upload failed: network error"));
    xhr.send(formData);
  });
}

/**
 * Build a transformed Cloudinary delivery URL from a public_id.
 * Example: cld("tasia/gallery/abc123", "w_800,q_auto,f_auto")
 * @param {string} publicId
 * @param {string} [transformation]
 */
export function cld(publicId, transformation = "q_auto,f_auto") {
  if (!CLOUD_NAME) return "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
}

/**
 * Insert one or more transformation segments into an existing Cloudinary
 * delivery URL, right after "/upload/". Each argument becomes its own
 * "/"-separated transformation step, applied in order — e.g.
 *   withTransform(url, "e_trim", "c_fill,ar_3:4,g_auto,q_auto,f_auto")
 * trims a uniform-color border first, then crops the trimmed result to a
 * 3:4 box. No-ops (returns the url unchanged) for non-Cloudinary URLs.
 * @param {string} url
 * @param {...string} steps
 */
export function withTransform(url, ...steps) {
  if (!url || !url.includes("/upload/") || steps.length === 0) return url;
  return url.replace("/upload/", `/upload/${steps.join("/")}/`);
}
