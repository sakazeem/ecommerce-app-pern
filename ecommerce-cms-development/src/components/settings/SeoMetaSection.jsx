import SectionWrapper from './SectionWrapper';
import FieldRow from './FieldRow';
import InputAreaTwo from '@/components/form/input/InputAreaTwo';
import Error from '@/components/form/others/Error';
import Uploader from '@/components/image-uploader/Uploader';

const SeoMetaSection = ({ hook }) => {
  const {
    isSubmitting, register, errors,
    metaOgImage, setMetaOgImage,
  } = hook;

  return (
    <SectionWrapper
      title="SEO & Meta"
      description="Control how your store appears in search engines and social media previews."
      isSubmitting={isSubmitting}
    >
      <FieldRow label="Meta Title" hint="Page title shown in search results (max 160 chars)">
        <InputAreaTwo
          register={register}
          name="meta_title"
          type="text"
          placeholder="My Awesome Store — Best Deals Online"
          label="Meta Title"
        />
        <Error errorName={errors.meta_title} />
      </FieldRow>

      <FieldRow label="Meta Description" hint="Short description shown in search results (max 320 chars)">
        <textarea
          {...register('meta_description')}
          rows={3}
          placeholder="Discover the best deals on electronics, fashion and more."
          className="w-full px-3 py-2 rounded border border-customGray-300 dark:border-customGray-600 bg-customWhite dark:bg-customGray-700 text-sm text-customGray-800 dark:text-customGray-200 focus:outline-none focus:ring-1 focus:ring-customBlue-500 resize-none"
        />
        <Error errorName={errors.meta_description} />
      </FieldRow>

      <FieldRow label="Meta Keywords" hint="Comma-separated keywords (less critical today, but still used)">
        <InputAreaTwo
          register={register}
          name="meta_keywords"
          type="text"
          placeholder="shoes, fashion, accessories"
          label="Meta Keywords"
        />
        <Error errorName={errors.meta_keywords} />
      </FieldRow>

      <FieldRow label="OG / Social Share Image" hint="Shown when shared on Facebook, WhatsApp etc. (1200×630 recommended)">
        <Uploader imageUrl={metaOgImage} setImageUrl={setMetaOgImage} />
      </FieldRow>

      <FieldRow label="Canonical URL" hint="The preferred URL for your homepage (prevents duplicate content)">
        <InputAreaTwo
          register={register}
          name="meta_canonical_url"
          type="url"
          placeholder="https://yourstore.com"
          label="Canonical URL"
        />
        <Error errorName={errors.meta_canonical_url} />
      </FieldRow>

      <FieldRow label="Google Site Verification" hint="Content value from Google Search Console verification meta tag">
        <InputAreaTwo
          register={register}
          name="google_site_verification"
          type="text"
          placeholder="abc123XYZ..."
          label="Google Verification"
        />
        <Error errorName={errors.google_site_verification} />
      </FieldRow>
    </SectionWrapper>
  );
};

export default SeoMetaSection;
