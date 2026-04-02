'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		const table = await queryInterface.describeTable('media');

		// If column already exists, skip safely
		if (table.media_type) {
			console.log(
				'Column media_type already exists in media table. Skipping...'
			);
			return;
		}

		await queryInterface.addColumn('media', 'media_type', {
			type: Sequelize.ENUM('image', 'video'),
			allowNull: false,
			defaultValue: 'image',
		});

		// Optional: backfill nulls just in case old rows somehow get affected
		await queryInterface.sequelize.query(`
      UPDATE "media"
      SET "media_type" = 'image'
      WHERE "media_type" IS NULL
    `);
	},

	async down(queryInterface, Sequelize) {
		const table = await queryInterface.describeTable('media');

		// If column doesn't exist, skip safely
		if (!table.media_type) {
			console.log(
				'Column media_type does not exist in media table. Skipping rollback...'
			);
			return;
		}

		await queryInterface.removeColumn('media', 'media_type');

		// Clean enum type in PostgreSQL if no longer needed
		if (queryInterface.sequelize.getDialect() === 'postgres') {
			await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM pg_type
            WHERE typname = 'enum_media_media_type'
          ) THEN
            DROP TYPE "enum_media_media_type";
          END IF;
        END
        $$;
      `);
		}
	},
};
