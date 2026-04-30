'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('user_activity_log', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			app_user_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: { model: 'app_user', key: 'id' },
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
			},
			session_id: {
				type: Sequelize.STRING(255),
			},
			event_type: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},

			// ── Customer info (dedicated columns for easy CMS querying) ──────
			customer_name: { type: Sequelize.STRING(255) },
			customer_email: { type: Sequelize.STRING(255) },
			customer_phone: { type: Sequelize.STRING(50) },
			shipping_address: { type: Sequelize.TEXT },
			shipping_city: { type: Sequelize.STRING(100) },
			shipping_country: { type: Sequelize.STRING(100) },
			shipping_postal_code: { type: Sequelize.STRING(20) },
			payment_method: { type: Sequelize.STRING(50) },

			// ── Order financials ─────────────────────────────────────────────
			subtotal: { type: Sequelize.DECIMAL(10, 2) },
			shipping_cost: { type: Sequelize.DECIMAL(10, 2) },
			total: { type: Sequelize.DECIMAL(10, 2) },

			// ── Cart items snapshot ──────────────────────────────────────────
			// Array of { id, sku, title, qty, variantId, variantTitle, price, discount_percentage, finalPrice }
			order_items: { type: Sequelize.JSONB },

			// ── Free-form extras (billing address, error details, etc.) ──────
			payload: { type: Sequelize.JSONB },

			order_tracking_id: { type: Sequelize.STRING(100) },
			page_url: { type: Sequelize.TEXT },
			client_timestamp: { type: Sequelize.DATE },
			is_synced: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('NOW()'),
			},
		});

		await queryInterface.addIndex('user_activity_log', ['app_user_id'], {
			name: 'idx_ual_app_user_id',
		});
		await queryInterface.addIndex('user_activity_log', ['session_id'], {
			name: 'idx_ual_session_id',
		});
		await queryInterface.addIndex('user_activity_log', ['event_type'], {
			name: 'idx_ual_event_type',
		});
		await queryInterface.addIndex(
			'user_activity_log',
			['order_tracking_id'],
			{ name: 'idx_ual_order_tracking_id' }
		);
		await queryInterface.addIndex('user_activity_log', ['customer_email'], {
			name: 'idx_ual_customer_email',
		});
		await queryInterface.addIndex('user_activity_log', ['customer_phone'], {
			name: 'idx_ual_customer_phone',
		});
		await queryInterface.addIndex('user_activity_log', ['created_at'], {
			name: 'idx_ual_created_at',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('user_activity_log');
	},
};
