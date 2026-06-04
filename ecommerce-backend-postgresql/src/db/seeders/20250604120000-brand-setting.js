'use strict';

const SETTING_NAME = 'brandSetting';

const seedData = {
  // Logos — null so static assets in storeSettingsKidsTheme.js act as fallback
  logo_light: null,
  logo_dark:  null,
  favicon:    null,

  // Brand colors
  primary_color:   '#5DABEA',
  secondary_color: '#E95CA7',

  // Business info
  business_address: 'Karachi, Pakistan',
  phone:    '+92 334 000 2625',
  whatsapp: '+92 334 000 2625',
  email:    'babiesnbaba@gmail.com',

  // Orders
  max_qty_per_product_per_order: 0,

  // Social links
  social_facebook:  'https://www.facebook.com/babiesandbaba',
  social_instagram: 'https://www.instagram.com/babiesnbaba/',
  social_tiktok:    'https://www.tiktok.com/@babiesnbaba',
  social_pinterest: 'https://www.pinterest.com/babiesnbaba/',
  social_youtube:   'https://www.youtube.com/@Babiesnbaba',
  social_linktree:  'https://linktr.ee/babiesnbaba',
  social_website:   null,
  social_whatsapp:  null,

  // Global discount
  global_discount_enabled: false,
  global_discount_percent: null,
  global_discount_label:   null,

  // SEO / Meta
  meta_title:               'BabiesNBaba - Online Baby Store for Clothes, Toys & Essentials',
  meta_description:         'Discover a wide range of baby products at BabiesNBaba. From cute clothes to toys and essentials, shop quality items for your little one with ease.',
  meta_keywords:            'baby store, baby clothes, baby products, pakistan, babiesnbaba',
  meta_og_image:            null,
  meta_canonical_url:       null,
  google_site_verification: null,
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM setting WHERE name = :name LIMIT 1`,
      {
        replacements: { name: SETTING_NAME },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (existing.length > 0) {
      console.log(`brandSetting row already exists — skipping.`);
      return;
    }

    return queryInterface.bulkInsert('setting', [
      {
        name:       SETTING_NAME,
        setting:    JSON.stringify(seedData),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('setting', { name: SETTING_NAME }, {});
  },
};
