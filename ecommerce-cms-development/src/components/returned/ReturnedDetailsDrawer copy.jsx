import { useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";

//internal import
import ReturnedServices from "@/services/ReturnedServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import DrawerHeader from "../newComponents/DrawerHeader";

const ReturnRequestDetailsDrawer = ({ id, data }) => {
	const [returnDetails, setReturnDetails] = useState({});
	const [loading, setLoading] = useState(true);
	const [courierTrackingId, setCourierTrackingId] = useState("");
	const [isEditingTracking, setIsEditingTracking] = useState(false);
	const [isSavingTracking, setIsSavingTracking] = useState(false);
	const [adminNote, setAdminNote] = useState("");
	const [isEditingNote, setIsEditingNote] = useState(false);
	const [isSavingNote, setIsSavingNote] = useState(false);
	const [processingAction, setProcessingAction] = useState(null);

	useEffect(() => {
		if (id) {
			(async () => {
				try {
					setLoading(true);
					const res = await ReturnedServices.getReturnedById(id);
					if (res) {
						setReturnDetails(res);
						setCourierTrackingId(res.courier_tracking_id || "");
						setAdminNote(res.admin_note || "");
					}
				} catch (err) {
					notifyError(err ? err.response?.data?.message : err.message);
				} finally {
					setLoading(false);
				}
			})();
		}
	}, [id]);

	const handleSaveCourierTracking = async () => {
		try {
			setIsSavingTracking(true);
			await ReturnedServices.updateReturn(id, {
				courier_tracking_id: courierTrackingId,
			});
			setReturnDetails((prev) => ({
				...prev,
				courier_tracking_id: courierTrackingId,
			}));
			setIsEditingTracking(false);
			notifySuccess("Courier tracking ID updated successfully");
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setIsSavingTracking(false);
		}
	};

	const handleCancelTrackingEdit = () => {
		setCourierTrackingId(returnDetails.courier_tracking_id || "");
		setIsEditingTracking(false);
	};

	const handleSaveAdminNote = async () => {
		try {
			setIsSavingNote(true);
			await ReturnedServices.updateReturn(id, { admin_note: adminNote });
			setReturnDetails((prev) => ({ ...prev, admin_note: adminNote }));
			setIsEditingNote(false);
			notifySuccess("Admin note updated successfully");
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setIsSavingNote(false);
		}
	};

	const handleCancelNoteEdit = () => {
		setAdminNote(returnDetails.admin_note || "");
		setIsEditingNote(false);
	};

	const handleApproveReturn = async () => {
		try {
			setProcessingAction("approve");
			await ReturnedServices.approveReturn(id);
			setReturnDetails((prev) => ({
				...prev,
				status: "approved",
				approved_at: new Date().toISOString(),
			}));
			notifySuccess("Return request approved successfully");
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setProcessingAction(null);
		}
	};

	const handleRejectReturn = async () => {
		try {
			setProcessingAction("reject");
			await ReturnedServices.rejectReturn(id);
			setReturnDetails((prev) => ({ ...prev, status: "rejected" }));
			notifySuccess("Return request rejected");
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setProcessingAction(null);
		}
	};

	const handleMarkReturnReceived = async () => {
		try {
			setProcessingAction("received");
			await ReturnedServices.markReturnReceived(id);
			setReturnDetails((prev) => ({
				...prev,
				status: "received",
				received_at: new Date().toISOString(),
			}));
			notifySuccess("Return marked as received");
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setProcessingAction(null);
		}
	};

	const handleProcessRefund = async () => {
		try {
			setProcessingAction("refund");
			await ReturnedServices.processRefund(id);
			setReturnDetails((prev) => ({ ...prev, status: "completed" }));
			notifySuccess("Refund processed successfully");
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setProcessingAction(null);
		}
	};

	const getStatusBadge = (status) => {
		const statusConfig = {
			requested: {
				bg: "bg-amber-50 dark:bg-amber-900/20",
				text: "text-amber-700 dark:text-amber-400",
				border: "border-amber-200 dark:border-amber-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
							clipRule="evenodd"
						/>
					</svg>
				),
			},
			approved: {
				bg: "bg-blue-50 dark:bg-blue-900/20",
				text: "text-blue-700 dark:text-blue-400",
				border: "border-blue-200 dark:border-blue-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
				),
			},
			rejected: {
				bg: "bg-red-50 dark:bg-red-900/20",
				text: "text-red-700 dark:text-red-400",
				border: "border-red-200 dark:border-red-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						/>
					</svg>
				),
			},
			received: {
				bg: "bg-purple-50 dark:bg-purple-900/20",
				text: "text-purple-700 dark:text-purple-400",
				border: "border-purple-200 dark:border-purple-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
							clipRule="evenodd"
						/>
					</svg>
				),
			},
			completed: {
				bg: "bg-emerald-50 dark:bg-emerald-900/20",
				text: "text-emerald-700 dark:text-emerald-400",
				border: "border-emerald-200 dark:border-emerald-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
				),
			},
		};

		const config = statusConfig[status] || statusConfig.requested;

		return (
			<span
				className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border ${config.bg} ${config.text} ${config.border}`}>
				{config.icon}
				{status}
			</span>
		);
	};

	const getInspectionStatusBadge = (status) => {
		const statusConfig = {
			pending: {
				bg: "bg-gray-50 dark:bg-gray-900/20",
				text: "text-gray-700 dark:text-gray-400",
				border: "border-gray-200 dark:border-gray-800",
			},
			passed: {
				bg: "bg-green-50 dark:bg-green-900/20",
				text: "text-green-700 dark:text-green-400",
				border: "border-green-200 dark:border-green-800",
			},
			failed: {
				bg: "bg-red-50 dark:bg-red-900/20",
				text: "text-red-700 dark:text-red-400",
				border: "border-red-200 dark:border-red-800",
			},
		};

		const config = statusConfig[status] || statusConfig.pending;

		return (
			<span
				className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase border ${config.bg} ${config.text} ${config.border}`}>
				{status}
			</span>
		);
	};

	const getTypeBadge = (type) => {
		const typeConfig = {
			refund: {
				bg: "bg-indigo-50 dark:bg-indigo-900/20",
				text: "text-indigo-700 dark:text-indigo-400",
				border: "border-indigo-200 dark:border-indigo-800",
				icon: (
					<svg
						className="w-3.5 h-3.5 mr-1.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
						/>
					</svg>
				),
			},
			exchange: {
				bg: "bg-cyan-50 dark:bg-cyan-900/20",
				text: "text-cyan-700 dark:text-cyan-400",
				border: "border-cyan-200 dark:border-cyan-800",
				icon: (
					<svg
						className="w-3.5 h-3.5 mr-1.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
						/>
					</svg>
				),
			},
		};

		const config = typeConfig[type] || typeConfig.refund;

		return (
			<span
				className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border ${config.bg} ${config.text} ${config.border}`}>
				{config.icon}
				{type}
			</span>
		);
	};

	if (loading) {
		return (
			<>
				<DrawerHeader id={id} updateTitle={"Return Request Details"} />
				<div className="flex items-center justify-center h-96">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
				</div>
			</>
		);
	}

	return (
		<>
			<DrawerHeader id={id} updateTitle={"Return Request Details"} />

			<Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-customGray-700 dark:text-customGray-200">
				<div className="p-6 space-y-6">
					{/* Return Request Header */}
					<div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
						<div className="flex items-start justify-between mb-3">
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-2">
									<h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
										Return Request #{returnDetails.id}
									</h2>
									{getTypeBadge(returnDetails.type)}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Order:{" "}
									<span className="font-semibold text-gray-900 dark:text-gray-100">
										#{returnDetails.order?.tracking_id}
									</span>
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									Requested on{" "}
									{new Date(returnDetails.requested_at).toLocaleDateString(
										"en-US",
										{
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										},
									)}
								</p>
							</div>
							<div className="flex flex-col gap-2 items-end">
								<p>
									<span className="text-sm text-gray-500">Status: </span>
									{getStatusBadge(returnDetails.status)}
								</p>
								{/* <p>
									<span className="text-sm text-gray-500">Inspection: </span>
									{getInspectionStatusBadge(returnDetails.inspection_status)}
								</p> */}
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					{returnDetails.status !== "rejected" &&
						returnDetails.status !== "completed" && (
							<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
								<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
									Quick Actions
								</h3>
								<div className="grid grid-cols-2 gap-3">
									{returnDetails.status === "requested" && (
										<>
											<button
												onClick={handleApproveReturn}
												disabled={processingAction !== null}
												className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
												{processingAction === "approve" ? (
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
												) : (
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
												)}
												Approve Return
											</button>

											<button
												onClick={handleRejectReturn}
												disabled={processingAction !== null}
												className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
												{processingAction === "reject" ? (
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
												) : (
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												)}
												Reject Return
											</button>
										</>
									)}

									{returnDetails.status === "approved" && (
										<button
											onClick={handleMarkReturnReceived}
											disabled={processingAction !== null}
											className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
											{processingAction === "received" ? (
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
											) : (
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
													/>
												</svg>
											)}
											Mark as Received
										</button>
									)}

									{returnDetails.status === "received" &&
										returnDetails.type === "refund" && (
											<button
												onClick={handleProcessRefund}
												disabled={processingAction !== null}
												className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
												{processingAction === "refund" ? (
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
												) : (
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
														/>
													</svg>
												)}
												Process Refund
											</button>
										)}
								</div>
							</div>
						)}

					{/* Courier Tracking ID Section */}
					{/* <div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center">
								<div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
									<svg
										className="w-5 h-5 text-orange-600 dark:text-orange-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
										/>
									</svg>
								</div>
								<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
									Return Courier Tracking
								</h3>
							</div>

							{!isEditingTracking && (
								<button
									onClick={() => setIsEditingTracking(true)}
									className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
									{courierTrackingId ? "Edit" : "Add"}
								</button>
							)}
						</div>

						<div className="pl-13">
							{!isEditingTracking ? (
								<div>
									{courierTrackingId ? (
										<div className="flex items-center gap-2">
											<span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-customGray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-customGray-600">
												{courierTrackingId}
											</span>
											<button
												onClick={() => {
													navigator.clipboard.writeText(courierTrackingId);
													notifySuccess("Tracking ID copied to clipboard");
												}}
												className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
												title="Copy to clipboard">
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button>
										</div>
									) : (
										<p className="text-sm text-gray-500 dark:text-gray-400 italic">
											No tracking ID added yet
										</p>
									)}
								</div>
							) : (
								<div className="space-y-3">
									<input
										type="text"
										value={courierTrackingId}
										onChange={(e) => setCourierTrackingId(e.target.value)}
										placeholder="Enter courier tracking ID"
										className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-customGray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-customGray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
									/>
									<div className="flex gap-2">
										<button
											onClick={handleSaveCourierTracking}
											disabled={isSavingTracking || !courierTrackingId.trim()}
											className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
											{isSavingTracking ? (
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
											onClick={handleCancelTrackingEdit}
											disabled={isSavingTracking}
											className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-customGray-700 dark:hover:bg-customGray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					</div> */}

					{/* Customer Information */}
					<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-blue-600 dark:text-blue-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Customer Information
							</h3>
						</div>

						<div className="space-y-3 pl-13">
							<div className="flex items-start">
								<span className="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
									Name
								</span>
								<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
									{returnDetails.user?.name || "-"}
								</span>
							</div>
							<div className="flex items-start">
								<span className="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
									Email
								</span>
								<span className="text-sm text-gray-700 dark:text-gray-300">
									{returnDetails.user?.email || "-"}
								</span>
							</div>
							<div className="flex items-start">
								<span className="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
									Phone
								</span>
								<span className="text-sm text-gray-700 dark:text-gray-300">
									{returnDetails.user?.phone || "-"}
								</span>
							</div>
						</div>
					</div>

					{/* Product Information */}
					<div className="bg-white dark:bg-customGray-800 rounded-xl border border-gray-200 dark:border-customGray-600 shadow-sm overflow-hidden">
						<div className="flex items-center px-5 py-4 bg-gray-50 dark:bg-customGray-750 border-b border-gray-200 dark:border-customGray-600">
							<div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-purple-600 dark:text-purple-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
									/>
								</svg>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Product Details
							</h3>
						</div>

						<div className="p-5">
							<div className="flex items-start gap-4">
								{returnDetails.order_item?.product?.thumbnailImage && (
									<img
										src={
											import.meta.env.VITE_APP_CLOUDINARY_URL +
											returnDetails.order_item.product.thumbnailImage.url
										}
										alt={returnDetails.order_item.product_title}
										className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-customGray-600"
									/>
								)}
								<div className="flex-1">
									<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
										{returnDetails.order_item?.product_title}
									</h4>

									{returnDetails.order_item?.product_variant?.attributes && (
										<div className="flex flex-wrap gap-2 mb-3">
											{returnDetails.order_item.product_variant.attributes.map(
												(attr) => (
													<span
														key={attr.id}
														className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-customGray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-customGray-600">
														<span className="capitalize">{attr.name.en}:</span>
														<span className="ml-1 capitalize">
															{attr.pva.value.en}
														</span>
													</span>
												),
											)}
										</div>
									)}

									<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
										<span className="flex items-center">
											<span className="font-medium mr-1">Return Qty:</span>{" "}
											{returnDetails.quantity}
										</span>
										<span className="flex items-center">
											<span className="font-medium mr-1">Price:</span> Rs.{" "}
											{parseFloat(returnDetails.order_item?.price).toFixed(2)}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Return Reason & Notes */}
					<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Return Details
							</h3>
						</div>

						<div className="space-y-4 pl-13">
							<div>
								<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
									Reason
								</p>
								<p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-customGray-750 px-3 py-2 rounded-lg">
									{returnDetails.reason || "-"}
								</p>
							</div>

							{returnDetails.customer_note && (
								<div>
									<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
										Customer Note
									</p>
									<p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-customGray-750 px-3 py-2 rounded-lg">
										{returnDetails.customer_note}
									</p>
								</div>
							)}

							<div>
								<div className="flex items-center justify-between mb-1">
									<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
										Admin Note
									</p>
									{!isEditingNote && (
										<button
											onClick={() => setIsEditingNote(true)}
											className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
											{adminNote ? "Edit" : "Add Note"}
										</button>
									)}
								</div>

								{!isEditingNote ? (
									<p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-customGray-750 px-3 py-2 rounded-lg">
										{adminNote || "No admin note added"}
									</p>
								) : (
									<div className="space-y-2">
										<textarea
											value={adminNote}
											onChange={(e) => setAdminNote(e.target.value)}
											placeholder="Enter admin note"
											rows={3}
											className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-customGray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-customGray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
										/>
										<div className="flex gap-2">
											<button
												onClick={handleSaveAdminNote}
												disabled={isSavingNote}
												className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors">
												{isSavingNote ? "Saving..." : "Save"}
											</button>
											<button
												onClick={handleCancelNoteEdit}
												disabled={isSavingNote}
												className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-customGray-700 dark:hover:bg-customGray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors">
												Cancel
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Media Attachments */}
					{(returnDetails.images?.length > 0 || returnDetails.video) && (
						<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
							<div className="flex items-center mb-4">
								<div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mr-3">
									<svg
										className="w-5 h-5 text-pink-600 dark:text-pink-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
									Media Attachments
								</h3>
							</div>

							<div className="space-y-4 pl-13">
								{returnDetails.images?.length > 0 && (
									<div>
										<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
											Images
										</p>
										<div className="grid grid-cols-3 gap-3">
											{returnDetails.images.map((image, index) => (
												<a
													key={index}
													href={image}
													target="_blank"
													rel="noopener noreferrer"
													className="block group">
													<img
														src={
															image
																? import.meta.env.VITE_APP_CLOUDINARY_URL +
																	image
																: null
														}
														alt={`Return evidence ${index + 1}`}
														className="w-full h-auto max-h-48 object-cover rounded-lg border border-gray-200 dark:border-customGray-600 group-hover:opacity-80 transition-opacity"
													/>
												</a>
											))}
										</div>
									</div>
								)}

								{returnDetails.video && (
									<div>
										<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
											Video
										</p>
										<video
											controls
											className="w-full max-h-48 rounded-lg border border-gray-200 dark:border-customGray-600"
											src={
												returnDetails.video
													? import.meta.env.VITE_APP_CLOUDINARY_URL +
														returnDetails.video
													: null
											}
										/>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Timeline */}
					<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Timeline
							</h3>
						</div>

						<div className="pl-13 space-y-3">
							{returnDetails.requested_at && (
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
									<div>
										<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
											Return Requested
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{new Date(returnDetails.requested_at).toLocaleString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												},
											)}
										</p>
									</div>
								</div>
							)}

							{returnDetails.approved_at && (
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
									<div>
										<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
											Return Approved
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{new Date(returnDetails.approved_at).toLocaleString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												},
											)}
										</p>
									</div>
								</div>
							)}

							{returnDetails.received_at && (
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
									<div>
										<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
											Product Received
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{new Date(returnDetails.received_at).toLocaleString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												},
											)}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</Scrollbars>
		</>
	);
};

export default ReturnRequestDetailsDrawer;
