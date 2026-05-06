'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('notification', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			message: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			image: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			productId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM('unread', 'read'),
				allowNull: false,
				defaultValue: 'unread',
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('notification');
	},
};
