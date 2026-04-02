const db = require('../db/models');

async function registerPermissions(
	moduleName,
	actions = ['create', 'edit', 'delete', 'view'],
	show = true
) {
	const adminRole = await db.role.findOne({ where: { name: 'admin' } });
	if (!adminRole) {
		throw new Error('Admin role not found');
	}

	for (const action of actions) {
		const name = `${action}_${moduleName}`;
		const description = `Can ${action} ${moduleName}`;
		const parent = moduleName;

		const [perm] = await db.permission.findOrCreate({
			where: { name },
			defaults: { description, parent, show },
		});

		// Associate permission with admin role
		await adminRole.addPermission(perm);
	}

	console.log(
		`✅ Permissions for module "${moduleName}" registered and assigned to admin.`
	);
}

module.exports = registerPermissions;
