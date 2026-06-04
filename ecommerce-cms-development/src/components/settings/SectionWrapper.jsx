import { Button } from '@windmill/react-ui';
import spinnerLoadingImage from '@/assets/img/spinner.gif';

const SectionWrapper = ({ title, description, isSubmitting, children }) => (
  <div className="max-w-3xl mx-auto">
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-customGray-800 dark:text-customGray-200">{title}</h2>
      {description && (
        <p className="text-sm text-customGray-500 dark:text-customGray-400 mt-1">{description}</p>
      )}
    </div>
    <hr className="mb-8 border-customGray-200 dark:border-customGray-700" />
    <div className="space-y-6">{children}</div>
    <div className="flex justify-end mt-8 pt-4 border-t border-customGray-200 dark:border-customGray-700">
      {isSubmitting ? (
        <Button disabled type="button" className="h-10 px-6">
          <img src={spinnerLoadingImage} alt="Loading" width={20} height={10} />
          <span className="ml-2 font-light">Processing…</span>
        </Button>
      ) : (
        <Button type="submit" className="h-10 px-6">Save Changes</Button>
      )}
    </div>
  </div>
);

export default SectionWrapper;
