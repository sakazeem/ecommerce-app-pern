'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		// Enable trigram extension
		await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);

		// Fast text search index
		await queryInterface.sequelize.query(`
      CREATE INDEX idx_product_translation_title_trgm
      ON product_translation
      USING gin (title gin_trgm_ops);
    `);

		// Optional: excerpt search
		await queryInterface.sequelize.query(`
      CREATE INDEX idx_product_translation_excerpt_trgm
      ON product_translation
      USING gin (excerpt gin_trgm_ops);
    `);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_product_translation_title_trgm;
    `);

		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_product_translation_excerpt_trgm;
    `);

		await queryInterface.sequelize.query(`
      DROP EXTENSION IF EXISTS pg_trgm;
    `);
	},
};
