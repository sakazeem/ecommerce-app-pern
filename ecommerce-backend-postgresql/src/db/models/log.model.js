module.exports = (sequelize, DataTypes) => {
	const log = sequelize.define(
		'log',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			model: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			record_id: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			action: {
				type: DataTypes.STRING, // create, update, delete
				allowNull: true,
			},

			method: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			end_point: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			status_code: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},

			message: {
				type: DataTypes.TEXT,
				allowNull: true,
			},

			request_body: {
				type: DataTypes.JSONB,
				allowNull: true,
			},

			old_values: {
				type: DataTypes.JSONB,
				allowNull: true,
			},

			new_values: {
				type: DataTypes.JSONB,
				allowNull: true,
			},

			changed_fields: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
			},

			user_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},

			created_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			tableName: 'log',
			timestamps: false,
		}
	);

	log.associate = (models) => {
		log.belongsTo(models.user, {
			foreignKey: 'user_id',
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	};

	return log;
};
