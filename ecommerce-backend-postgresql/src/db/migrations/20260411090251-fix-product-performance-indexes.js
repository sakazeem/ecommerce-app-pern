'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		// =========================
		// 1. REMOVE REDUNDANT INDEX
		// =========================
		await queryInterface
			.removeIndex('product', 'idx_product_id_desc')
			.catch(() => {});

		// =========================
		// 3. ENABLE PG TRIGRAM (SEARCH BOOST)
		// =========================
		await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);

		// =========================
		// 4. FAST PRODUCT SEARCH INDEX
		// =========================
		await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_product_translation_title_trgm
      ON product_translation
      USING gin (title gin_trgm_ops);
    `);

		await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_product_translation_excerpt_trgm
      ON product_translation
      USING gin (excerpt gin_trgm_ops);
    `);

		// =========================
		// 5. JOIN PERFORMANCE INDEXES
		// =========================

		// Product -> Category relation table
		await queryInterface
			.addIndex('product_category', ['product_id'], {
				name: 'idx_product_category_product_id',
			})
			.catch(() => {});

		await queryInterface
			.addIndex('product_category', ['category_id'], {
				name: 'idx_product_category_category_id',
			})
			.catch(() => {});

		// Product variants
		await queryInterface
			.addIndex('product_variant', ['product_id'], {
				name: 'idx_product_variant_product_id',
			})
			.catch(() => {});

		// Variant attributes
		await queryInterface
			.addIndex('product_variant_to_attribute', ['product_variant_id'], {
				name: 'idx_variant_attr_variant_id',
			})
			.catch(() => {});
	},

	async down(queryInterface, Sequelize) {
		// Remove safe indexes
		await queryInterface
			.removeIndex('product', 'idx_product_base_price')
			.catch(() => {});
		await queryInterface
			.removeIndex('product', 'idx_product_brand_id')
			.catch(() => {});

		await queryInterface
			.removeIndex('product_category', 'idx_product_category_product_id')
			.catch(() => {});

		await queryInterface
			.removeIndex('product_category', 'idx_product_category_category_id')
			.catch(() => {});

		await queryInterface
			.removeIndex('product_variant', 'idx_product_variant_product_id')
			.catch(() => {});

		await queryInterface
			.removeIndex(
				'product_variant_to_attribute',
				'idx_variant_attr_variant_id'
			)
			.catch(() => {});

		// Drop trigram indexes safely
		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_product_translation_title_trgm;
    `);

		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_product_translation_excerpt_trgm;
    `);
	},
};
