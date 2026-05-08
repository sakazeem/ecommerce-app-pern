'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const desc = await queryInterface.describeTable('category_translation');
		if (!desc.tag) {
			await queryInterface.addColumn('category_translation', 'tag', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},
	down: async (queryInterface) => {
		await queryInterface.removeColumn('category_translation', 'tag');
	},
};
