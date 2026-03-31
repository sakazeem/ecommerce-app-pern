const { baseScopes } = require('./base_model');

module.exports = (sequelize, DataTypes) => {
	const address = sequelize.define(
		'address',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			address: { type: DataTypes.TEXT, allowNull: false },
			apartment: { type: DataTypes.TEXT, allowNull: true },
			city: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			country: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			postal_code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			type: {
				type: DataTypes.ENUM('general', 'shipping', 'billing'), // use general for both/all
				allowNull: false,
			},
			app_user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'app_user',
					key: 'id',
					as: 'user',
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'address',
			timestamps: true,
			// ...baseScopes(),
		}
	);
	address.associate = (models) => {
		address.belongsTo(models.app_user, {
			foreignKey: 'app_user_id',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
			as: 'user',
		});
	};

	return address;
};
