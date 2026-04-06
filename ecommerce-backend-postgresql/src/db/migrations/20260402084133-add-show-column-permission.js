'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable(
			'permission'
		);

		if (!tableDescription.show) {
			await queryInterface.addColumn('permission', 'show', {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			});
		}
	},

	down: async (queryInterface) => {
		const tableDescription = await queryInterface.describeTable(
			'permission'
		);

		if (tableDescription.show) {
			await queryInterface.removeColumn('permission', 'show');
		}
	},
};
