import SectionWrapper from "./SectionWrapper";
import FieldRow from "./FieldRow";
import Error from "@/components/form/others/Error";

const ColorInput = ({ register, name, errors }) => (
  <div className="flex items-center gap-3">
    <input
      {...register(name, {
        pattern: {
          value: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
          message: "Must be a valid hex color (e.g. #FF5733)",
        },
      })}
      type="color"
      className="h-10 w-12 rounded border border-customGray-300 dark:border-customGray-600 cursor-pointer bg-transparent"
    />
    <input
      {...register(name)}
      type="text"
      placeholder="#000000"
      className="flex-1 h-10 px-3 rounded border border-customGray-300 dark:border-customGray-600 bg-customWhite dark:bg-customGray-700 text-sm text-customGray-800 dark:text-customGray-200 focus:outline-none focus:ring-1 focus:ring-customBlue-500"
    />
    <Error errorName={errors?.[name]} />
  </div>
);

const BrandColorsSection = ({ hook }) => {
  const { isSubmitting, register, errors } = hook;

  return (
    <SectionWrapper
      title="Brand Colors"
      description="Primary and secondary colors used by the storefront theme."
      isSubmitting={isSubmitting}
    >
      <FieldRow
        label="Primary Color"
        hint="Main buttons, links, accents (--color-primary)"
      >
        <ColorInput register={register} name="primary_color" errors={errors} />
      </FieldRow>

      <FieldRow
        label="Secondary Color"
        hint="Secondary buttons, badges (--color-secondary)"
      >
        <ColorInput
          register={register}
          name="secondary_color"
          errors={errors}
        />
      </FieldRow>
    </SectionWrapper>
  );
};

export default BrandColorsSection;
