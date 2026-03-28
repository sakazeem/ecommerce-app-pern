const { baseScopes } = require('./base_model');

module.exports = (sequelize, DataTypes) => {
	const order = sequelize.define(
		'order',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},

			// guest user fields
			guest_first_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			guest_last_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			guest_phone: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			guest_email: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			// Shipping Address
			shipping_address: { type: DataTypes.TEXT, allowNull: false },
			shipping_apartment: { type: DataTypes.TEXT, allowNull: true },
			shipping_city: { type: DataTypes.STRING, allowNull: false },
			shipping_country: { type: DataTypes.STRING, allowNull: false },
			shipping_postal_code: { type: DataTypes.STRING, allowNull: true },

			// Billing Address
			billing_address: { type: DataTypes.TEXT, allowNull: false },
			billing_apartment: { type: DataTypes.TEXT, allowNull: true },
			billing_city: { type: DataTypes.STRING, allowNull: false },
			billing_country: { type: DataTypes.STRING, allowNull: false },
			billing_postal_code: { type: DataTypes.STRING, allowNull: true },

			payment_method: {
				type: DataTypes.STRING, // cod, ibft, payfast, easypaisa, etc
				allowNull: false,
			},

			// public unique tracking id for customer order tracking
			tracking_id: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			},

			// courier tracking id for order tracking
			courier_tracking_id: {
				type: DataTypes.STRING,
				allowNull: true,
				// unique: true,
			},

			// ccl courier details
			courier_details: {
				type: DataTypes.JSONB, // {city, service, weight, trackingId}
				allowNull: true,
			},

			status: {
				type: DataTypes.ENUM(
					'pending',
					'in_progress',
					'cancelled',
					'delivered',
					'return_requested',
					'returned',
					'refunded',
					'exchanged'
				),
				allowNull: false,
				defaultValue: 'pending',
			},
			order_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
			shipping: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
			total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

			delivered_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},

			app_user_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'app_user',
					key: 'id',
					as: 'user',
				},
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			},
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'order',
			timestamps: true,
		}
	);
	order.associate = (models) => {
		order.belongsTo(models.app_user, {
			foreignKey: 'app_user_id',
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
			as: 'user',
		});
		order.hasMany(models.order_item, {
			foreignKey: 'order_id',
		});
	};

	return order;
};
