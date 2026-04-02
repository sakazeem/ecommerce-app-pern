const { baseFields } = require('./base_model');
const modelValidators = require('./model_validators');

// models/homepage_sections.js
module.exports = (sequelize, DataTypes) => {
	const homepage_sections = sequelize.define(
		'homepage_sections',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			/** slider | banner | categories | products */
			type: {
				type: DataTypes.ENUM(
					'slider',
					'banner',
					'categories',
					'tab',
					'products',
					'video_slider'
				),
				allowNull: false,
			},

			/** Optional section heading */
			title: {
				type: DataTypes.JSONB,
				allowNull: true,
				validate: {
					isValidOption(value) {
						modelValidators.stringWithTranslation(value, 'title');
					},
				},
			},

			/** Drag & drop ordering */
			position: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			/**
			 * All section-specific config goes here
			 * Different for each type
			 */
			config: {
				type: DataTypes.JSONB,
				allowNull: false,
				defaultValue: {},
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
			status: baseFields.status,
		},
		{
			tableName: 'homepage_sections',
			timestamps: true,
		}
	);

	homepage_sections.associate = (models) => {
		homepage_sections.belongsTo(models.user, {
			foreignKey: 'user_id',
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	};

	return homepage_sections;
};

// config examples
