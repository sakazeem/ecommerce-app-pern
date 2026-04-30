module.exports = (sequelize, DataTypes) => {
	const user_activity_log = sequelize.define(
		'user_activity_log',
		{
			id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			app_user_id:   { type: DataTypes.INTEGER, allowNull: true,
			                 references: { model: 'app_user', key: 'id' },
			                 onDelete: 'SET NULL', onUpdate: 'CASCADE' },
			session_id:    { type: DataTypes.STRING(255), allowNull: true },
			event_type:    { type: DataTypes.STRING(100), allowNull: false },

			// Customer
			customer_name:        { type: DataTypes.STRING(255), allowNull: true },
			customer_email:       { type: DataTypes.STRING(255), allowNull: true },
			customer_phone:       { type: DataTypes.STRING(50),  allowNull: true },
			shipping_address:     { type: DataTypes.TEXT,        allowNull: true },
			shipping_city:        { type: DataTypes.STRING(100), allowNull: true },
			shipping_country:     { type: DataTypes.STRING(100), allowNull: true },
			shipping_postal_code: { type: DataTypes.STRING(20),  allowNull: true },
			payment_method:       { type: DataTypes.STRING(50),  allowNull: true },

			// Financials
			subtotal:      { type: DataTypes.DECIMAL(10, 2), allowNull: true },
			shipping_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
			total:         { type: DataTypes.DECIMAL(10, 2), allowNull: true },

			// Cart snapshot — array of { id, sku, title, qty, variantId, variantTitle, price, discount_percentage, finalPrice }
			order_items:   { type: DataTypes.JSONB, allowNull: true },

			// Extras (billing address when different, errors, etc.)
			payload:       { type: DataTypes.JSONB, allowNull: true },

			order_tracking_id: { type: DataTypes.STRING(100), allowNull: true },
			page_url:          { type: DataTypes.TEXT,        allowNull: true },
			client_timestamp:  { type: DataTypes.DATE,        allowNull: true },
			is_synced:         { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: false },
			created_at:        { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
		},
		{
			tableName: 'user_activity_log',
			timestamps: false,
		}
	);

	user_activity_log.associate = (models) => {
		user_activity_log.belongsTo(models.app_user, {
			foreignKey: 'app_user_id',
			as: 'user',
		});
	};

	return user_activity_log;
};
