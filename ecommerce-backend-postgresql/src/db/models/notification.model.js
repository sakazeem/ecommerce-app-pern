module.exports = (sequelize, DataTypes) => {
	const notification = sequelize.define(
		'notification',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			message: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			is_read: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		},
		{
			tableName: 'notification',
			timestamps: true,
			underscored: true,
		}
	);

	return notification;
};
