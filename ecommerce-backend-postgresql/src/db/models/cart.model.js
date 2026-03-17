module.exports = (sequelize, DataTypes) => {
	const cart = sequelize.define(
		'cart',
		{
			product_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: { model: 'product', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			product_variant_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: { model: 'product_variant', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			app_user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: { model: 'app_user', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1,
				validate: { min: 1 },
			},
		},
		{
			tableName: 'cart',
			timestamps: true,
			uniqueKeys: {
				unique_cart_item: {
					fields: ['app_user_id', 'product_id', 'product_variant_id'],
				},
			},
		}
	);

	cart.associate = (models) => {
		cart.belongsTo(models.product, {
			foreignKey: 'product_id',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
		cart.belongsTo(models.product_variant, {
			foreignKey: 'product_variant_id',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
		cart.belongsTo(models.app_user, {
			foreignKey: 'app_user_id',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
	};

	return cart;
};
