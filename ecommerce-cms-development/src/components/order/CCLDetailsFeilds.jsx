import { useState } from "react";
import { toast } from "react-toastify";
import { CCL_CITIES } from "./CCLCities";

const SHIPPING_SERVICES = [
	{
		id: "3",
		label: "LEO (1 to 2 KG)",
	},

	{
		id: "15",
		label: "LEO - Detain (3 to 5 KG)",
	},
	{
		id: "16",
		label: "LEO - Overland (above 5KG)",
	},
	{
		id: "1",
		label: "TCS",
	},
	{
		id: "13",
		label: "TCS - Detain",
	},
	{
		id: "21",
		label: "TRAX",
	},
	{
		id: "22",
		label: "TRAX - Detain",
	},
	{
		id: "17",
		label: "POSTEX",
	},
	{
		id: "40",
		label: "POSTEX - Detain",
	},
];
const CCLDetailsFeilds = ({
	shippingCity,
	shippingService,
	shippingWeight,
	setShippingCity,
	setShippingService,
	setShippingWeight,
	submitShippingDetails,
	courierTrackingId,
}) => {
	const [cities, setCities] = useState(CCL_CITIES);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!shippingCity || !shippingService || !shippingWeight) {
			toast.error("Please fill all shipping details");
			return;
		}

		try {
			setIsSaving(true);
			await submitShippingDetails();
			setIsEditing(false);
		} catch (err) {
			toast.error("Failed to save shipping details");
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	return (
		<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm mt-4">
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
					Shipping Details
				</h3>

				{!isEditing && (
					<button
						onClick={() => setIsEditing(true)}
						className="text-sm font-medium text-blue-600 hover:text-blue-700">
						{shippingCity ? "Edit" : "Add"}
					</button>
				)}
			</div>

			{/* Content */}
			{!isEditing ? (
				<div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
					{shippingCity ? (
						<div className="flex flex-col gap-2">
							<p className="text-gray-900">
								<span className="text-gray-500 font/-semibold min-w-20 inline-block">
									City:
								</span>{" "}
								{getCityNameFromId(shippingCity)}
							</p>
							<p className="text-gray-900">
								<span className="text-gray-500 font/-semibold min-w-20 inline-block">
									Service:
								</span>{" "}
								{SHIPPING_SERVICES.find((s) => s.id == shippingService)?.label}
							</p>
							<p className="text-gray-900">
								<span className="text-gray-500 font/-semibold min-w-20 inline-block">
									Weight:
								</span>{" "}
								{shippingWeight} kg
							</p>
							<p className="text-gray-900">
								<span className="text-gray-500 font/-semibold min-w-20 inline-block">
									Tracking Id:
								</span>{" "}
								{courierTrackingId || "-"}
							</p>
						</div>
					) : (
						<p className="italic text-gray-500">
							No shipping details added yet
						</p>
					)}
				</div>
			) : (
				<div className="space-y-3">
					<div className="grid grid-cols-3 gap-3">
						{/* City */}
						<select
							value={shippingCity}
							onChange={(e) => setShippingCity(e.target.value)}
							className="border rounded-lg p-2 text-sm dark:bg-customGray-700">
							<option value="">Select City</option>
							{cities.map((city) => (
								<option key={city.id} value={city.id}>
									{city.title}
								</option>
							))}
						</select>

						{/* Service */}
						<select
							value={shippingService}
							onChange={(e) => setShippingService(e.target.value)}
							className="border rounded-lg p-2 text-sm dark:bg-customGray-700">
							<option value="">Shipping Service</option>
							{SHIPPING_SERVICES.map((v) => (
								<option key={v.id} value={v.id}>
									{v.label}
								</option>
							))}
						</select>

						{/* Weight */}
						<input
							type="number"
							placeholder="Weight (kg)"
							value={shippingWeight}
							onChange={(e) => setShippingWeight(e.target.value)}
							className="border rounded-lg p-2 text-sm dark:bg-customGray-700"
						/>
					</div>

					{/* Buttons */}

					<div className="flex gap-2 justify-end">
						<button
							onClick={handleSave}
							disabled={isSaving}
							className="px-4 py-2 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
							{isSaving ? (
								<>
									<svg
										className="animate-spin h-4 w-4"
										fill="none"
										viewBox="0 0 24 24">
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Saving...
								</>
							) : (
								<>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Save
								</>
							)}
						</button>
						<button
							onClick={handleCancel}
							disabled={isSaving}
							className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-customGray-700 dark:hover:bg-customGray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CCLDetailsFeilds;

const getCityNameFromId = (cityId) => {
	return CCL_CITIES.find((v) => v.id === cityId)?.title || "No City Found";
};
