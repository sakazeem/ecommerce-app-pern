import { useRef } from "react";
import { Button, Card, CardBody, Input } from "@windmill/react-ui";
import { FiPlus } from "react-icons/fi";
import AnimatedContent from "../common/AnimatedContent";

const SearchAndFilter = ({
  onSubmitFilter = () => {},
  inputPlaceholder = "",
  buttonText = "",
  onClick = () => {},
  showAddButtom = true, // fixed typo
  showDateFilter = false,
  showSkuFilter = false,
}) => {
  const formRef = useRef(null);
  const inputRef = useRef(null); // ref for search input
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const skuRef = useRef(null);

  // Handler for form submit
  const handleSubmit = () => {
    const searchValue = inputRef.current?.value || "";
    const result = { search: searchValue };
    if (showDateFilter) {
      const start = startDateRef.current?.value;
      const end = endDateRef.current?.value;
      if (start) result.startDate = start;
      if (end) result.endDate = end;
    }
    if (showSkuFilter) {
      const sku = skuRef.current?.value;
      if (sku) result.sku = sku;
    }
    onSubmitFilter(result);
  };

  // Handler for form reset
  const handleReset = () => {
    if (formRef.current) formRef.current.reset();
    if (inputRef.current) inputRef.current.value = "";
    if (startDateRef.current) startDateRef.current.value = "";
    if (endDateRef.current) endDateRef.current.value = "";
    if (skuRef.current) skuRef.current.value = "";
    onSubmitFilter({ search: "", startDate: "", endDate: "", sku: "" });
  };

  return (
    <AnimatedContent>
      <Card className="min-w-0 shadow-xs overflow-hidden bg-customWhite dark:bg-customGray-800 rounded-t-lg rounded-0 mb-4">
        <CardBody>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault(); // prevent default page reload
              handleSubmit(); // call separate handler
            }}
            className="py-3 grid gap-4 lg:gap-6 xl:gap-6 md:flex xl:flex"
          >
            {/* Search Input */}
            <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
              <Input
                ref={inputRef}
                type="search"
                name="search"
                placeholder={inputPlaceholder}
              />
            </div>

            {showDateFilter && (
              <div className="flex items-center gap-2 flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <Input
                  ref={startDateRef}
                  type="date"
                  name="startDate"
                  placeholder="Start Date"
                />
                <Input
                  ref={endDateRef}
                  type="date"
                  name="endDate"
                  placeholder="End Date"
                />
              </div>
            )}

            {showSkuFilter && (
              <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <Input
                  ref={skuRef}
                  type="search"
                  name="sku"
                  placeholder="Filter by SKU"
                />
              </div>
            )}

            {/* Filter & Reset Buttons */}
            <div className="flex items-center gap-2 flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
              <div className="w-full mx-1">
                <Button type="submit" className="h-12 w-full bg-customTeal-700">
                  Filter
                </Button>
              </div>

              <div className="w-full mx-1">
                <Button
                  layout="outline"
                  type="button"
                  onClick={handleReset}
                  className="px-4 md:py-1 py-2 h-12 text-sm dark:bg-customGray-700"
                >
                  <span className="text-customBlack dark:text-customGray-200">
                    Reset
                  </span>
                </Button>
              </div>
            </div>

            {/* Add Button */}
            {showAddButtom && (
              <div className="w-full md:w-48 lg:w-48 xl:w-48">
                <Button onClick={onClick} className="rounded-md h-12 w-full">
                  <span className="mr-2">
                    <FiPlus />
                  </span>
                  {buttonText}
                </Button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>
    </AnimatedContent>
  );
};

export default SearchAndFilter;
