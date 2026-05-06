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
			image: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			productId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM('unread', 'read'),
				allowNull: false,
				defaultValue: 'unread',
			},
		},
		{
			tableName: 'notification',
			timestamps: true,
		}
	);

	return notification;
};
