module.exports = (sequelize, DataTypes) => {
	const category_translation = sequelize.define(
		'category_translation',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			category_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'category',
					key: 'id',
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			language_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'language',
					key: 'id',
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			slug: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			tag: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			tableName: 'category_translation',
			timestamps: true,
			indexes: [
				{
					unique: true,
					fields: ['category_id', 'language_id'],
					name: 'uniq_category_language_id',
				},
				{
					unique: true,
					fields: ['slug', 'language_id'], // unique per lang
					name: 'uniq_category_slug_language',
				},
			],
		}
	);

	category_translation.associate = (models) => {
		category_translation.belongsTo(models.category, {
			foreignKey: 'category_id',
			as: 'parentCategory',
			onDelete: 'CASCADE',
		});
		category_translation.belongsTo(models.language, {
			foreignKey: 'language_id',
			as: 'language',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
	};

	return category_translation;
};
