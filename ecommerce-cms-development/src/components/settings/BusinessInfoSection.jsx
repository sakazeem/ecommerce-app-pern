import SectionWrapper from './SectionWrapper';
import FieldRow from './FieldRow';
import InputAreaTwo from '@/components/form/input/InputAreaTwo';
import Error from '@/components/form/others/Error';

const BusinessInfoSection = ({ hook }) => {
  const { isSubmitting, register, errors } = hook;

  return (
    <SectionWrapper
      title="Contact & Address"
      description="Business contact details shown on the storefront, invoices, and emails."
      isSubmitting={isSubmitting}
    >
      <FieldRow label="Business Address" hint="Full mailing address">
        <textarea
          {...register('business_address')}
          rows={3}
          placeholder="123 Main St, City, Country"
          className="w-full px-3 py-2 rounded border border-customGray-300 dark:border-customGray-600 bg-customWhite dark:bg-customGray-700 text-sm text-customGray-800 dark:text-customGray-200 focus:outline-none focus:ring-1 focus:ring-customBlue-500 resize-none"
        />
        <Error errorName={errors.business_address} />
      </FieldRow>

      <FieldRow label="Phone Number" hint="With country code, e.g. +92 300 1234567">
        <InputAreaTwo
          register={register}
          name="phone"
          type="tel"
          placeholder="+92 300 1234567"
          label="Phone"
        />
        <Error errorName={errors.phone} />
      </FieldRow>

      <FieldRow label="WhatsApp Number" hint="Used for WhatsApp chat widget / link">
        <InputAreaTwo
          register={register}
          name="whatsapp"
          type="tel"
          placeholder="+92 300 1234567"
          label="WhatsApp"
        />
        <Error errorName={errors.whatsapp} />
      </FieldRow>

      <FieldRow label="Email Address" hint="Support / contact email shown publicly">
        <InputAreaTwo
          register={register}
          name="email"
          type="email"
          placeholder="hello@yourstore.com"
          label="Email"
        />
        <Error errorName={errors.email} />
      </FieldRow>
    </SectionWrapper>
  );
};

export default BusinessInfoSection;
