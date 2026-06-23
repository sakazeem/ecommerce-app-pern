'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('order', 'special_instructions', {
			type: Sequelize.TEXT,
			allowNull: true,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('order', 'special_instructions');
	},
};
