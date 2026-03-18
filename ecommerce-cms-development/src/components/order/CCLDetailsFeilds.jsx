import axios from "axios";
import React from "react";
import { toast } from "react-toastify";
//1 for TCS, 21 for TRAX, 3 for LEO, 17 for POSTEX, RIDER, CALL
const SHIPPING_SERVICES = [
	{ id: 1, label: "TCS" },
	{ id: 21, label: "TRAX" },
	{ id: 3, label: "LEO" },
	{ id: 17, label: "POSTEX" },
];

const CCLDetailsFeilds = ({
	shippingCity,
	shippingService,
	shippingWeight,
	setShippingCity,
	setShippingService,
	setShippingWeight,
	setShowShippingFields,
}) => {
	const [cities, setCities] = useState([]);

	const getCities = async () => {
		await axios
			.post("https://oyeah.pk/citiesapi", {
				clients: config.cclCourier.clients, //Client ID to be Provided by Admin - MANDATORY
				token: config.cclCourier.apiKey,
			})
			.then((res) => {
				setCities(res.data);
			})
			.catch((err) => {
				toast.error("Error fetching cities");
			});
	};

	return (
		<div className="bg-white dark:bg-customGray-800 border border-gray-200 dark:border-customGray-600 rounded-xl p-4 mt-4">
			<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
				Add Shipping Details
			</h3>

			<div className="grid grid-cols-3 gap-3">
				{/* City */}
				<select
					value={shippingCity}
					onChange={(e) => setShippingCity(e.target.value)}
					className="border rounded-lg p-2 text-sm dark:bg-customGray-700">
					<option value="">Select City</option>
					<option value="karachi">Karachi</option>
					<option value="lahore">Lahore</option>
					<option value="islamabad">Islamabad</option>
				</select>

				{/* Shipping Service */}
				<select
					value={shippingService}
					onChange={(e) => setShippingService(e.target.value)}
					className="border rounded-lg p-2 text-sm dark:bg-customGray-700">
					<option value="">Shipping Service</option>
					{SHIPPING_SERVICES.map((v, i) => {
						return (
							<option key={i} value={v.id}>
								{v.label}
							</option>
						);
					})}
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

			<div className="flex justify-end gap-2 mt-4">
				<button
					onClick={() => setShowShippingFields(false)}
					className="px-3 py-1.5 text-sm border rounded-lg">
					Cancel
				</button>

				<button
					onClick={submitShippingDetails}
					className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg">
					Confirm
				</button>
			</div>
		</div>
	);
};

export default CCLDetailsFeilds;
