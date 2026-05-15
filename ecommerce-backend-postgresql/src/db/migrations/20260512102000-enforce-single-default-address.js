'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.sequelize.query(
				`
					WITH ranked AS (
						SELECT
							id,
							ROW_NUMBER() OVER (
								PARTITION BY app_user_id, type
								ORDER BY is_default DESC, id ASC
							) AS rn
						FROM address
					)
					UPDATE address AS a
					SET is_default = CASE WHEN r.rn = 1 THEN TRUE ELSE FALSE END
					FROM ranked AS r
					WHERE a.id = r.id;
				`,
				{ transaction }
			);

			await queryInterface.sequelize.query(
				`
					CREATE UNIQUE INDEX IF NOT EXISTS address_one_default_per_user_type_idx
					ON address (app_user_id, type)
					WHERE is_default = TRUE;
				`,
				{ transaction }
			);
		});
	},

	async down(queryInterface) {
		await queryInterface.sequelize.query(
			'DROP INDEX IF EXISTS address_one_default_per_user_type_idx;'
		);
	},
};
