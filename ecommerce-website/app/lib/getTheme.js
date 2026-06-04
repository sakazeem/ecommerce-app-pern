import { storeSettingsKidsTheme } from "../data/storeSettingsKidsTheme";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchBrandSetting() {
  try {
    const res = await fetch(`${API_URL}/setting/brand/all`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Empty object = no row yet seeded
    return data && Object.keys(data).length > 0 ? data : null;
  } catch {
    return null;
  }
}

// Prefer DB value; fall back to static; never return empty string (use null/fallback)
const pick = (dbVal, fallback) =>
  dbVal !== undefined && dbVal !== null && dbVal !== "" ? dbVal : fallback;

export async function getTheme() {
  const base = storeSettingsKidsTheme;
  const b = await fetchBrandSetting(); // b = brand from DB, may be null

  return {
    ...base,

    // ── Logos ──────────────────────────────────────────────────────────
    content: {
      ...base.content,
      logo: pick(b?.logo_light, base.content.logo),
      footer: {
        ...base.content.footer,
        logo: pick(b?.logo_dark, base.content.footer.logo),
      },
    },

    // ── Favicon ────────────────────────────────────────────────────────
    favicon: pick(b?.favicon, base.favicon),

    // ── Theme colors ───────────────────────────────────────────────────
    theme: {
      ...base.theme,
      primary: pick(b?.primary_color, base.theme.primary),
      secondary: pick(b?.secondary_color, base.theme.secondary),
    },

    // ── Contact details ────────────────────────────────────────────────
    // Always falls back to hardcoded storeSettingsKidsTheme.details
    details: {
      address: pick(b?.business_address, base.details?.address || ""),
      contact: pick(b?.phone, base.details?.contact || ""),
      whatsapp: pick(b?.whatsapp, base.details?.whatsapp || ""),
      email: pick(b?.email, base.details?.email || ""),
    },

    // ── Social links ───────────────────────────────────────────────────
    // Merge: DB value wins per-key; falls back to base.socialLinks per-key
    socialLinks: {
      facebook: pick(b?.social_facebook, base.socialLinks?.facebook),
      instagram: pick(b?.social_instagram, base.socialLinks?.instagram),
      tiktok: pick(b?.social_tiktok, base.socialLinks?.tiktok),
      pinterest: pick(b?.social_pinterest, base.socialLinks?.pinterest),
      youtube: pick(b?.social_youtube, base.socialLinks?.youtube),
      linktree: pick(b?.social_linktree, base.socialLinks?.linktree),
      website: pick(b?.social_website, base.socialLinks?.website),
      whatsapp: pick(b?.social_whatsapp, base.socialLinks?.whatsapp),
    },

    // ── Global discount ────────────────────────────────────────────────
    globalDiscount: {
      enabled:
        b?.global_discount_enabled ?? base.globalDiscount?.enabled ?? false,
      percent: b?.global_discount_percent ?? base.globalDiscount?.percent ?? 0,
      label: pick(b?.global_discount_label, base.globalDiscount?.label ?? ""),
    },

    // ── Max qty per product ────────────────────────────────────────────
    maxQtyPerProductPerOrder:
      b?.max_qty_per_product_per_order ?? base.maxQtyPerProductPerOrder ?? 0,

    // ── SEO / Meta ─────────────────────────────────────────────────────
    // Falls back to hardcoded defaults in storeSettingsKidsTheme.metaTags
    metaTags: {
      title: pick(b?.meta_title, base.metaTags?.title || ""),
      description: pick(b?.meta_description, base.metaTags?.description || ""),
      keywords: pick(b?.meta_keywords, base.metaTags?.keywords || ""),
      ogImage: pick(b?.meta_og_image, base.metaTags?.ogImage || ""),
      canonical: pick(b?.meta_canonical_url, base.metaTags?.canonical || ""),
      googleSiteVerification: pick(
        b?.google_site_verification,
        base.metaTags?.googleSiteVerification || "",
      ),
    },
  };
}
