const httpStatus = require('http-status');
const { adminSettingService } = require('../../services/Admin');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const SETTING_NAME = {
	GLOBAL: 'globalSetting',
	STORE: 'storeSetting',
	CUSTOMIZATION: 'storeCustomizationSetting',
	BRAND: 'brandSetting',
};

const addGlobalSetting = catchAsync(async (req, res) => {
	await adminSettingService.createSetting(req.body);
	res.send({ message: 'Global Setting Added Successfully!' });
});

const getGlobalSetting = catchAsync(async (req, res) => {
	const result = await adminSettingService.findSettingByName(
		SETTING_NAME.GLOBAL
	);
	res.send(result?.setting || { message: 'Global Settings Not Found' });
});

const updateGlobalSetting = catchAsync(async (req, res) => {
	const updated = await adminSettingService.upsertSettingByName(
		SETTING_NAME.GLOBAL,
		req.body.setting
	);
	res.send(updated);
});

const addStoreSetting = catchAsync(async (req, res) => {
	await adminSettingService.createSetting(req.body);
	res.send({ message: 'Store Setting Added Successfully!' });
});

const getStoreSetting = catchAsync(async (req, res) => {
	const result = await adminSettingService.findSettingByName(
		SETTING_NAME.STORE
	);
	res.send(result?.setting || { message: 'Store Settings Not Found' });
});

const updateStoreSetting = catchAsync(async (req, res) => {
	const updated = await adminSettingService.upsertSettingByName(
		SETTING_NAME.STORE,
		req.body.setting
	);
	res.send({
		data: updated,
		message: 'Store Setting Update Successfully!',
	});
});

const addStoreCustomizationSetting = catchAsync(async (req, res) => {
	const setting = await adminSettingService.createSetting(req.body);
	res.send({
		data: setting,
		message: 'Online Store Customization Setting Added Successfully!',
	});
});

const getStoreCustomizationSetting = catchAsync(async (req, res) => {
	const result = await adminSettingService.findSettingByName(
		SETTING_NAME.CUSTOMIZATION
	);

	if (!result) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Store Customization Settings not found'
		);
	}

	res.send(result.setting || { message: 'Store Customization Not Found' });
});

const getStoreSeoSetting = catchAsync(async (req, res) => {
	const result = await adminSettingService.findSettingByName(
		SETTING_NAME.CUSTOMIZATION
	);
	res.send(
		result?.setting || {
			message: 'Store Customization Settings Not Found',
		}
	);
});

const updateStoreCustomizationSetting = catchAsync(async (req, res) => {
	const updated = await adminSettingService.upsertSettingByName(
		SETTING_NAME.CUSTOMIZATION,
		req.body.setting
	);
	res.send({
		data: updated,
		message: 'Online Store Customization Setting Update Successfully!',
	});
});

// ─── Brand / Store Identity Setting ────────────────────────────────────────────

const getBrandSetting = catchAsync(async (req, res) => {
	const result = await adminSettingService.findSettingByName(
		SETTING_NAME.BRAND
	);
	res.send(result?.setting || {});
});

const updateBrandSetting = catchAsync(async (req, res) => {
	const { setting } = req.body;

	// Basic server-side sanity: discount must be 0-100 if provided
	if (
		setting.global_discount_percent !== undefined &&
		setting.global_discount_percent !== null
	) {
		const pct = Number(setting.global_discount_percent);
		if (isNaN(pct) || pct < 0 || pct > 100) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'global_discount_percent must be between 0 and 100'
			);
		}
	}

	const updated = await adminSettingService.upsertSettingByName(
		SETTING_NAME.BRAND,
		setting
	);
	res.send({
		data: updated,
		message: 'Brand Setting updated successfully!',
	});
});

module.exports = {
	addGlobalSetting,
	getGlobalSetting,
	updateGlobalSetting,
	addStoreSetting,
	getStoreSetting,
	updateStoreSetting,
	getStoreSeoSetting,
	addStoreCustomizationSetting,
	getStoreCustomizationSetting,
	updateStoreCustomizationSetting,
	getBrandSetting,
	updateBrandSetting,
};
