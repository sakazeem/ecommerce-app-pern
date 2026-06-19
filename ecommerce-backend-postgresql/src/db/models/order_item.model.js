const { baseScopes } = require('./base_model');

module.exports = (sequelize, DataTypes) => {
	const order_item = sequelize.define(
		'order_item',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			order_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'order',
					key: 'id',
					onDelete: 'CASCADE',
					onUpdate: 'CASCADE',
				},
			},
			product_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'product',
					key: 'id',
				},
			},
			product_variant_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'product_variant',
					key: 'id',
				},
			},
			sku: {
				type: DataTypes.STRING, // add this column migration
				allowNull: false,
			},
			product_title: { type: DataTypes.STRING, allowNull: false },
			price: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'order_item',
			timestamps: true,
		}
	);
	order_item.associate = (models) => {
		order_item.belongsTo(models.order, {
			foreignKey: 'order_id',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
		order_item.belongsTo(models.product, {
			foreignKey: 'product_id',
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
		order_item.belongsTo(models.product_variant, {
			foreignKey: 'product_variant_id',
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
		order_item.hasMany(models.review, {
			foreignKey: 'order_item_id',
		});
	};

	return order_item;
};
