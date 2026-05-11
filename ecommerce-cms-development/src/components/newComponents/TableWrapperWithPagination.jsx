import {
	Pagination,
	TableContainer,
	TableFooter,
	Select,
} from "@windmill/react-ui";
import TableLoading from "../preloader/TableLoading";
import NotFound from "../table/NotFound";

const TableWrapperWithPagination = ({
	loading,
	error,
	data,
	children,
	onPageChange = () => {},
	onLimitChange = () => {}, // 👈 new prop
}) => {
	return loading ? (
		<TableLoading row={12} col={6} width={190} height={20} />
	) : error ? (
		<span className="text-center mx-auto text-customRed-500">{error}</span>
	) : data?.total !== 0 &&
	  (data?.records ? data?.records?.length !== 0 : true) ? (
		<TableContainer className="mb-8">
			{children}
			<TableFooter>
				{/* 🔽 Limit Dropdown */}
				<div className="flex gap-10">
					<Pagination
						totalResults={data.total || 10}
						resultsPerPage={data.limit || 10}
						// onChange={() => {}}
						onChange={(page) => onPageChange(page)} // 👈 fetch next page
						label="Table navigation"
						// className="width-[100%]"
						style={{ flex: 1 }}
					/>
					<div className="inline-flex items-center gap-2">
						<span className="text-xs font-bold whitespace-nowrap">
							Rows per page:
						</span>
						<Select
							value={data?.limit || 10}
							onChange={(e) => onLimitChange(Number(e.target.value))}
							className="w-24">
							<option value={8}>8</option>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={30}>30</option>
							<option value={40}>40</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</Select>
					</div>
				</div>
			</TableFooter>
		</TableContainer>
	) : (
		<NotFound title="Sorry, There are no data right now." />
	);
};

export default TableWrapperWithPagination;
