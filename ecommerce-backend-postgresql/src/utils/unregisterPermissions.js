const db = require('../db/models');

async function unregisterPermissions(moduleName) {
	const perms = await db.permission.findAll({
		where: { parent: moduleName },
	});

	if (!perms.length) return;

	const permIds = perms.map((p) => p.id);

	// remove associations
	await db.role_to_permission.destroy({
		where: { permission_id: permIds },
	});

	// delete permissions
	await db.permission.destroy({
		where: { id: permIds },
	});

	console.log(`🧹 All permissions for "${moduleName}" removed.`);
}
module.exports = unregisterPermissions;
