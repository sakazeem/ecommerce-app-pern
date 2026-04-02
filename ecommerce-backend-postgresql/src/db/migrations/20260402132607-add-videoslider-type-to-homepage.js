'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		// Add new enum value safely (won’t fail if already exists)
		await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_homepage_sections_type'
          AND e.enumlabel = 'video_slider'
        ) THEN
          ALTER TYPE "enum_homepage_sections_type" ADD VALUE 'video_slider';
        END IF;
      END
      $$;
    `);
	},

	async down(queryInterface, Sequelize) {
		// ⚠️ Postgres does NOT support removing enum values safely
		// So we leave this empty intentionally
	},
};
