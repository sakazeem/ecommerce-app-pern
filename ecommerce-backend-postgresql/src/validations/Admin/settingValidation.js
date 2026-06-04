const Joi = require('@hapi/joi');

const updateBrandSetting = {
	body: Joi.object().keys({
		setting: Joi.object()
			.keys({
				// Logos
				logo_light: Joi.string().uri().allow('', null),
				logo_dark: Joi.string().uri().allow('', null),
				favicon: Joi.string().uri().allow('', null),

				// Brand colors (only primary + secondary used by website theme)
				primary_color: Joi.string()
					.pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
					.allow('', null),
				secondary_color: Joi.string()
					.pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
					.allow('', null),

				// Business info
				business_address: Joi.string().max(500).allow('', null),
				phone: Joi.string().max(30).allow('', null),
				whatsapp: Joi.string().max(30).allow('', null),
				email: Joi.string()
					.email({ tlds: { allow: false } })
					.allow('', null),

				// Orders
				max_qty_per_product_per_order: Joi.number()
					.integer()
					.min(0)
					.allow(null),

				// Social — must match SOCIAL_CONFIG keys in KidsTheme Footer
				social_facebook: Joi.string().uri().allow('', null),
				social_instagram: Joi.string().uri().allow('', null),
				social_tiktok: Joi.string().uri().allow('', null),
				social_pinterest: Joi.string().uri().allow('', null),
				social_youtube: Joi.string().uri().allow('', null),
				social_linktree: Joi.string().uri().allow('', null),
				social_website: Joi.string().uri().allow('', null),
				social_whatsapp: Joi.string().uri().allow('', null),

				// Discount
				global_discount_enabled: Joi.boolean(),
				global_discount_percent: Joi.number()
					.min(0)
					.max(100)
					.allow(null),
				global_discount_label: Joi.string().max(100).allow('', null),

				// SEO / Meta
				meta_title: Joi.string().max(160).allow('', null),
				meta_description: Joi.string().max(320).allow('', null),
				meta_keywords: Joi.string().max(500).allow('', null),
				meta_og_image: Joi.string().uri().allow('', null),
				meta_canonical_url: Joi.string().uri().allow('', null),
				google_site_verification: Joi.string().max(200).allow('', null),
			})
			.required(),
	}),
};

module.exports = { updateBrandSetting };
