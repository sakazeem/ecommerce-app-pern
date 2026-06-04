import SectionWrapper from "./SectionWrapper";
import FieldRow from "./FieldRow";
import Uploader from "@/components/image-uploader/Uploader";

const BrandIdentitySection = ({ hook }) => {
  const {
    isSubmitting,
    logoLight,
    setLogoLight,
    logoDark,
    setLogoDark,
    favicon,
    setFavicon,
  } = hook;

  return (
    <SectionWrapper
      title="Brand & Logos"
      description="Upload your store logos and favicon."
      isSubmitting={isSubmitting}
    >
      <FieldRow
        label="Light Logo"
        hint="Shown on dark backgrounds (SVG, PNG, WEBP)"
      >
        <Uploader
          imageUrl={logoLight}
          setImageUrl={setLogoLight}
          mediaType="logo"
        />
      </FieldRow>

      <FieldRow
        label="Dark Logo"
        hint="Shown on light backgrounds / footer (SVG, PNG, WEBP)"
      >
        <Uploader
          imageUrl={logoDark}
          setImageUrl={setLogoDark}
          mediaType="logo"
        />
      </FieldRow>

      <FieldRow
        label="Favicon"
        hint="Browser tab icon (ICO, SVG, PNG — 32×32 recommended)"
      >
        <Uploader
          imageUrl={favicon}
          setImageUrl={setFavicon}
          mediaType="favicon"
        />
      </FieldRow>
    </SectionWrapper>
  );
};

export default BrandIdentitySection;
