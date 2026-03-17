'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('favourite', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			app_user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: 'app_user', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			product_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: 'product', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
		});

		await queryInterface.addConstraint('favourite', {
			fields: ['app_user_id', 'product_id'],
			type: 'unique',
			name: 'unique_favourite_item',
		});
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('favourite');
	},
};
