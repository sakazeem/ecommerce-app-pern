'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		// 1. Base price index (filtering)
		await queryInterface.addIndex('product', ['base_price'], {
			name: 'idx_product_base_price',
		});

		// 2. Brand index (filtering)
		await queryInterface.addIndex('product', ['brand_id'], {
			name: 'idx_product_brand_id',
		});

		// 3. ID desc index (sorting optimization)
		await queryInterface.addIndex('product', ['id'], {
			name: 'idx_product_id_desc',
			using: 'BTREE',
			order: [['id', 'DESC']],
		});

		// 4. Product translation slug index (fast lookup)
		await queryInterface.addIndex('product_translation', ['slug'], {
			name: 'idx_product_translation_slug',
		});

		// 5. Product translation language filter index
		await queryInterface.addIndex('product_translation', ['language_id'], {
			name: 'idx_product_translation_language_id',
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeIndex('product', 'idx_product_base_price');
		await queryInterface.removeIndex('product', 'idx_product_brand_id');
		await queryInterface.removeIndex('product', 'idx_product_id_desc');

		await queryInterface.removeIndex(
			'product_translation',
			'idx_product_translation_slug'
		);
		await queryInterface.removeIndex(
			'product_translation',
			'idx_product_translation_language_id'
		);
	},
};
