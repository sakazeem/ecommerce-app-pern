import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SidebarContext } from "@/context/SidebarContext";
import SettingServices from "@/services/SettingServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import useDisableForDemo from "./useDisableForDemo";

const useBrandSettingSubmit = () => {
  const { setIsUpdate } = useContext(SidebarContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalDiscountEnabled, setGlobalDiscountEnabled] = useState(false);

  const [logoLight, setLogoLight] = useState("");
  const [logoDark, setLogoDark] = useState("");
  const [favicon, setFavicon] = useState("");
  const [metaOgImage, setMetaOgImage] = useState("");

  const { handleDisableForDemo } = useDisableForDemo();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (handleDisableForDemo()) return;
    try {
      setIsSubmitting(true);
      const setting = {
        // Logos
        logo_light: logoLight,
        logo_dark: logoDark,
        favicon,

        // Brand colors
        primary_color: data.primary_color || null,
        secondary_color: data.secondary_color || null,

        // Business info
        business_address: data.business_address || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,

        // Orders
        max_qty_per_product_per_order: data.max_qty_per_product_per_order
          ? parseInt(data.max_qty_per_product_per_order)
          : 0,

        // Social — keys map to store.socialLinks in website
        social_facebook: data.social_facebook || null,
        social_instagram: data.social_instagram || null,
        social_tiktok: data.social_tiktok || null,
        social_pinterest: data.social_pinterest || null,
        social_youtube: data.social_youtube || null,
        social_linktree: data.social_linktree || null,
        social_website: data.social_website || null,
        social_whatsapp: data.social_whatsapp || null,

        // Discount
        global_discount_enabled: globalDiscountEnabled,
        global_discount_percent: data.global_discount_percent
          ? parseFloat(data.global_discount_percent)
          : null,
        global_discount_label: data.global_discount_label || null,

        // SEO
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        meta_keywords: data.meta_keywords || null,
        meta_og_image: metaOgImage,
        meta_canonical_url: data.meta_canonical_url || null,
        google_site_verification: data.google_site_verification || null,
      };

      await SettingServices.updateBrandSetting({ setting });
      setIsUpdate(true);
      notifySuccess("Settings saved successfully!");
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await SettingServices.getBrandSetting();
        if (!res || Object.keys(res).length === 0) return;

        setLogoLight(res.logo_light || "");
        setLogoDark(res.logo_dark || "");
        setFavicon(res.favicon || "");
        setMetaOgImage(res.meta_og_image || "");
        setGlobalDiscountEnabled(res.global_discount_enabled || false);

        const fields = [
          "primary_color",
          "secondary_color",
          "business_address",
          "phone",
          "whatsapp",
          "email",
          "max_qty_per_product_per_order",
          "social_facebook",
          "social_instagram",
          "social_tiktok",
          "social_pinterest",
          "social_youtube",
          "social_linktree",
          "social_website",
          "social_whatsapp",
          "global_discount_percent",
          "global_discount_label",
          "meta_title",
          "meta_description",
          "meta_keywords",
          "meta_canonical_url",
          "google_site_verification",
        ];
        fields.forEach((f) => setValue(f, res[f] ?? ""));
      } catch (err) {
        notifyError(err?.response?.data?.message || err?.message);
      }
    })();
  }, []);

  return {
    errors,
    register,
    handleSubmit,
    onSubmit,
    isSubmitting,
    watch,
    setValue,
    logoLight,
    setLogoLight,
    logoDark,
    setLogoDark,
    favicon,
    setFavicon,
    metaOgImage,
    setMetaOgImage,
    globalDiscountEnabled,
    setGlobalDiscountEnabled,
  };
};

export default useBrandSettingSubmit;
