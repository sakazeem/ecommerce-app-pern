import SectionWrapper from './SectionWrapper';
import FieldRow from './FieldRow';
import InputAreaTwo from '@/components/form/input/InputAreaTwo';
import Error from '@/components/form/others/Error';

const MaxQtySection = ({ hook }) => {
  const { isSubmitting, register, errors } = hook;

  return (
    <SectionWrapper
      title="Order Limits"
      description="Global rules that apply to every product in the store."
      isSubmitting={isSubmitting}
    >
      <FieldRow
        label="Max Quantity Per Product Per Order"
        hint="Global limit — customers cannot add more than this quantity of any single product. Set to 0 to disable."
      >
        <InputAreaTwo
          register={register}
          name="max_qty_per_product_per_order"
          type="number"
          placeholder="e.g. 5  (0 = no limit)"
          label="Max Qty"
        />
        <Error errorName={errors.max_qty_per_product_per_order} />
      </FieldRow>
    </SectionWrapper>
  );
};

export default MaxQtySection;
