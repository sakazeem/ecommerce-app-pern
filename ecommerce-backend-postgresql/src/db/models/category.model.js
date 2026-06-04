const {
	baseFields,
	baseScopes,
	baseAssociation,
	mediaField,
	mediaAssociation,
} = require('./base_model');

module.exports = (sequelize, DataTypes) => {
	const category = sequelize.define(
		'category',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			// 🔹 Self-referencing parent
			parent_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'category',
					key: 'id',
				},
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			is_leaf: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true, // temporary default
			},

			// 🔹 Optional but VERY useful
			level: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
			attribute_type: {
				type: DataTypes.STRING,
				allowNull: true,
				defaultValue: 'baby',
			},
			icon: { ...mediaField, field: 'icon', as: 'cat_icon' },
			weight: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'user',
					key: 'id',
				},
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			},
			...baseFields,
		},
		{
			tableName: 'category',
			timestamps: true,
			...baseScopes(),
		}
	);

	category.associate = (models) => {
		category.belongsTo(models.user, {
			foreignKey: 'user_id',
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
		// 🔹 Self hierarchy
		category.belongsTo(models.category, {
			as: 'parent',
			foreignKey: 'parent_id',
		});

		category.hasMany(models.category, {
			as: 'children',
			foreignKey: 'parent_id',
		});
		// Product linking (leaf category only)
		category.belongsToMany(models.product, {
			through: 'product_to_category',
			foreignKey: 'category_id',
			otherKey: 'product_id',
		});
		category.hasMany(models.category_translation, {
			foreignKey: 'category_id',
			as: 'translations',
			onDelete: 'CASCADE',
		});
		baseAssociation(category, models);
		mediaAssociation(category, models, 'icon', 'cat_icon');
	};

	return category;
};
