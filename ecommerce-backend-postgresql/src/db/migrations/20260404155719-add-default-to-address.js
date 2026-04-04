'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('address', 'is_default', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('address', 'is_default');
	},
};
