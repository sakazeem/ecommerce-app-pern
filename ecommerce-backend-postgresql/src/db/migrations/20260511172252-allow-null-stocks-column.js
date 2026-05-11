'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.changeColumn(
			'product_variant_to_branch',
			'stock',
			{
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 100,
			}
		);
		await queryInterface.changeColumn(
			'product_variant_to_branch',
			'low_stock',
			{
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 10,
			}
		);
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	},
};
