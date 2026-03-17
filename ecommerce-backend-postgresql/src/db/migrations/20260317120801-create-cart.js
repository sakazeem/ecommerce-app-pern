'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('cart', {
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
			product_variant_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: { model: 'product_variant', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			quantity: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 1,
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

		await queryInterface.addConstraint('cart', {
			fields: ['app_user_id', 'product_id', 'product_variant_id'],
			type: 'unique',
			name: 'unique_cart_item',
		});
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('cart');
	},
};
