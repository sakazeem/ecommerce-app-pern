module.exports = (sequelize, DataTypes) => {
	const permission = sequelize.define(
		'permission',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			parent: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			show: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
		},
		{
			tableName: 'permission',
			timestamps: true,
		}
	);

	permission.associate = (models) => {
		permission.belongsToMany(models.role, {
			through: 'role_to_permission',
			foreignKey: 'permission_id',
			otherKey: 'role_id',
		});
	};

	return permission;
};
