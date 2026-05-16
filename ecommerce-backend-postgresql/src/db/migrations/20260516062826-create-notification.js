'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('notification', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			message: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			is_read: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('NOW()'),
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('NOW()'),
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('notification');
	},
};
