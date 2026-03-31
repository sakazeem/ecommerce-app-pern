'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const desc = await queryInterface.describeTable('address');
		if (!desc.title) {
			await queryInterface.addColumn('address', 'status', {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			});
		}
	},
	down: async (queryInterface) => {
		await queryInterface.removeColumn('address', 'status');
	},
};
