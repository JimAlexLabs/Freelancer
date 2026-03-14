/**
 * AfriGig Supabase Storage Layer
 * Handles file uploads for: CV, KYC docs, portfolio files, milestone deliverables, avatars.
 *
 * Buckets (create these in Supabase Dashboard → Storage):
 *   - cv-uploads          (private) — CVs and resumes
 *   - kyc-documents       (private) — ID photos, selfies
 *   - portfolio-files     (public)  — Portfolio work samples
 *   - milestone-files     (private) — Milestone deliverables
 *   - avatars             (public)  — Profile avatars
 */

import { supabase } from "./supabaseClient.js";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = {
  cv: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  kyc: ["image/jpeg", "image/png", "image/webp"],
  portfolio: ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif", "application/zip"],
  milestone: ["application/pdf", "application/zip", "image/jpeg", "image/png", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
};

/**
 * Upload a file to Supabase Storage.
 * @param {File} file - The file to upload
 * @param {"cv"|"kyc"|"portfolio"|"milestone"|"avatar"} type - Upload type
 * @param {string} userId - User UUID
 * @param {object} [meta] - Extra metadata (e.g., { jobId, kycType: "id_front" })
 * @returns {{ url: string, path: string, error?: string }}
 */
export async function uploadFile(file, type, userId, meta = {}) {
  if (!file) return { error: "No file provided" };
  if (file.size > MAX_SIZE) return { error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB` };

  const allowed = ALLOWED_TYPES[type] || [];
  if (allowed.length > 0 && !allowed.includes(file.type)) {
    return { error: `Invalid file type. Allowed: ${allowed.join(", ")}` };
  }

  const BUCKETS = {
    cv: "cv-uploads",
    kyc: "kyc-documents",
    portfolio: "portfolio-files",
    milestone: "milestone-files",
    avatar: "avatars",
  };

  const bucket = BUCKETS[type];
  if (!bucket) return { error: "Unknown upload type" };

  // Build unique path
  const ext = file.name.split(".").pop().toLowerCase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
  let path;

  switch (type) {
    case "cv":
      path = `${userId}/cv_${Date.now()}.${ext}`;
      break;
    case "kyc":
      path = `${userId}/${meta.kycType || "doc"}_${Date.now()}.${ext}`;
      break;
    case "portfolio":
      path = `${userId}/${meta.label || "portfolio"}_${Date.now()}.${ext}`;
      break;
    case "milestone":
      path = `${meta.jobId || "job"}/${userId}/${meta.milestone || "deliverable"}_${Date.now()}.${ext}`;
      break;
    case "avatar":
      path = `${userId}/avatar.${ext}`;
      break;
    default:
      path = `${userId}/${safeName}_${Date.now()}.${ext}`;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: type === "avatar", // Avatars overwrite, others are versioned
        contentType: file.type,
      });

    if (error) {
      console.warn("[storage] upload error:", error.message);
      return { error: error.message };
    }

    // Get public or signed URL
    let url;
    const isPublicBucket = ["portfolio-files", "avatars"].includes(bucket);

    if (isPublicBucket) {
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
      url = pub.publicUrl;
    } else {
      const { data: signed, error: signErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 60 * 60 * 24 * 7); // 7-day signed URL
      if (signErr) return { error: signErr.message };
      url = signed.signedUrl;
    }

    return { url, path: data.path, bucket };
  } catch (err) {
    return { error: err.message || "Upload failed" };
  }
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error?.message };
}

/**
 * Get a fresh signed URL for a private file.
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

/**
 * List files uploaded by a user in a bucket.
 */
export async function listUserFiles(bucket, userId) {
  const { data, error } = await supabase.storage.from(bucket).list(userId, {
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) return [];
  return data || [];
}

/**
 * React hook for file upload with progress state.
 * Returns { upload, uploading, progress, error, reset }
 */
export function useFileUpload() {
  // Not using React hooks in this file to keep it framework-agnostic.
  // The upload function is used directly in components.
}

/**
 * Ensure required Storage buckets exist.
 * Call this once during admin setup.
 */
export async function ensureBuckets() {
  const buckets = [
    { name: "cv-uploads", public: false },
    { name: "kyc-documents", public: false },
    { name: "portfolio-files", public: true },
    { name: "milestone-files", public: false },
    { name: "avatars", public: true },
  ];

  const results = [];
  for (const b of buckets) {
    const { error } = await supabase.storage.createBucket(b.name, {
      public: b.public,
      allowedMimeTypes: null,
      fileSizeLimit: MAX_SIZE,
    });
    results.push({ name: b.name, created: !error, error: error?.message });
  }
  return results;
}
