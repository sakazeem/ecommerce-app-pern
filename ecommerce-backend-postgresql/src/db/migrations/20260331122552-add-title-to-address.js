'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const desc = await queryInterface.describeTable('address');
		if (!desc.title) {
			await queryInterface.addColumn('address', 'title', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},
	down: async (queryInterface) => {
		await queryInterface.removeColumn('address', 'title');
	},
};
