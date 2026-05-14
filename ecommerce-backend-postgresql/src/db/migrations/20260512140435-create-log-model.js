'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('log', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			model: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			record_id: {
				type: Sequelize.STRING,
				allowNull: true,
			},

			action: {
				type: Sequelize.STRING, // create, update, delete
				allowNull: true,
			},

			method: {
				type: Sequelize.STRING,
				allowNull: true,
			},

			end_point: {
				type: Sequelize.STRING,
				allowNull: true,
			},

			status_code: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},

			message: {
				type: Sequelize.TEXT,
				allowNull: true,
			},

			request_body: {
				type: Sequelize.JSONB,
				allowNull: true,
			},

			old_values: {
				type: Sequelize.JSONB,
				allowNull: true,
			},

			new_values: {
				type: Sequelize.JSONB,
				allowNull: true,
			},

			changed_fields: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
			},

			user_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},

			created_at: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
		});
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('log');
	},
};
