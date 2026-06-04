import SectionWrapper from './SectionWrapper';
import FieldRow from './FieldRow';
import InputAreaTwo from '@/components/form/input/InputAreaTwo';
import SwitchToggle from '@/components/form/switch/SwitchToggle';
import Error from '@/components/form/others/Error';

const GlobalDiscountSection = ({ hook }) => {
  const {
    isSubmitting, register, errors,
    globalDiscountEnabled, setGlobalDiscountEnabled,
    watch,
  } = hook;

  const pct = watch('global_discount_percent');

  return (
    <SectionWrapper
      title="Global Discount & Sale"
      description="Apply a sitewide discount to all products. Individual product discounts still apply on top of this."
      isSubmitting={isSubmitting}
    >
      <FieldRow label="Enable Global Sale" hint="Turns on the sitewide discount">
        <SwitchToggle
          id="global_discount"
          processOption={globalDiscountEnabled}
          handleProcess={setGlobalDiscountEnabled}
        />
      </FieldRow>

      <div
        style={{
          height: globalDiscountEnabled ? 'auto' : 0,
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          opacity: globalDiscountEnabled ? 1 : 0,
        }}
      >
        <div className="space-y-6 pt-2">
          <FieldRow label="Discount %" hint="Enter a value between 0 and 100">
            <InputAreaTwo
              register={register}
              name="global_discount_percent"
              type="number"
              placeholder="e.g. 20"
              label="Discount %"
              required={globalDiscountEnabled}
            />
            {pct > 0 && (
              <p className="text-xs text-green-600 mt-1">
                All products will show {pct}% off
              </p>
            )}
            <Error errorName={errors.global_discount_percent} />
          </FieldRow>

          <FieldRow label="Sale Label" hint="Text shown on the sale badge (e.g. 'Summer Sale')">
            <InputAreaTwo
              register={register}
              name="global_discount_label"
              type="text"
              placeholder="Summer Sale"
              label="Sale Label"
            />
            <Error errorName={errors.global_discount_label} />
          </FieldRow>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default GlobalDiscountSection;
