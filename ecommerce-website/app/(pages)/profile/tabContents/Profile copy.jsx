import React from "react";

const Profile = ({user}) => {
	return (
		<div className="bg-white rounded-lg p-6">
			<h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="text-sm text-gray-500 mb-1 block">Name</label>
					<p className="font-medium text-lg">{user.name}</p>
				</div>
				<div>
					<label className="text-sm text-gray-500 mb-1 block">Email</label>
					<p className="font-medium text-lg">{user.email}</p>
				</div>
				<div>
					<label className="text-sm text-gray-500 mb-1 block">Phone</label>
					<p className="font-medium text-lg">{user.phone}</p>
				</div>
			</div>
			<button className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
				Edit Profile
			</button>
		</div>
	);
};

export default Profile;
