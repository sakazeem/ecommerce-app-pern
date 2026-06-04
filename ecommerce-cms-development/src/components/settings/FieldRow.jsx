// Reusable 2-col field layout: label | input
const FieldRow = ({ label, hint, children }) => (
  <div className="grid md:grid-cols-5 items-start sm:grid-cols-12 gap-3 md:gap-5">
    <div className="sm:col-span-2">
      <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400">
        {label}
      </label>
      {hint && <p className="text-xs text-customGray-400 mt-0.5 font-normal">{hint}</p>}
    </div>
    <div className="sm:col-span-3">{children}</div>
  </div>
);

export default FieldRow;
