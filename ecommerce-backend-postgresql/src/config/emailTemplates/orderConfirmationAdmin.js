const orderConfirmationAdminTemplate = ({
	orderId,
	customer,
	items,
	total,
	shipping,
	paymentMethod,
	billingAddress = null,
}) => {
	const itemsHtml = items
		.map(
			(item) => `
			<tr style="border-bottom:1px solid #eee;">
				<td style="padding:10px 0;">${item.title}</td>
				<td style="padding:10px 0;">${item.sku || '-'}</td>
				<td style="padding:10px 0;" align="center">${item.quantity}</td>
				<td style="padding:10px 0;" align="right">Rs ${item.finalPrice}</td>
			</tr>
		`
		)
		.join('');

	return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px; margin:0;">
	<table width="100%" cellpadding="0" cellspacing="0">
		<tr>
			<td align="center">
				<table width="600" style="background:#ffffff; padding:24px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

					<!-- Logo -->
					<tr>
						<td align="center" style="padding-bottom:20px; color:#616161; font-size:20px; font-weight:bold;">
							<a href="https://babiesnbaba.com" target="_blank" style="text-decoration:none; color:#616161;">
								<img src="https://babiesnbaba.com/logo.png" alt="B. Babies n Baba" width="175" style="display:block;"/>
							</a>
						</td>
					</tr>

					<!-- Header -->
					<tr>
						<td>
							<h2 style="margin:0 0 10px; color:#5DABEA;">🛒 New Order Received</h2>
							<p style="margin:0 0 20px; color:#333;">
								<strong>Order ID:</strong> ${orderId}
							</p>
						</td>
					</tr>

					<!-- Customer Details -->
					<tr>
						<td>
							<h3 style="margin-bottom:10px; color:#E95CA7;">Customer Details</h3>
							<table width="100%" cellpadding="4" cellspacing="0">
								<tr><td><strong>Name:</strong></td><td>${customer.name || 'User'}</td></tr>
								<tr><td><strong>Email:</strong></td><td>${customer.email}</td></tr>
								<tr><td><strong>Phone:</strong></td><td>${customer.phone}</td></tr>
								<tr><td><strong>Address:</strong></td><td>${customer.address}</td></tr>
								<tr><td><strong>City:</strong></td><td>${customer.city}</td></tr>
								<tr><td><strong>Postal Code:</strong></td><td>${customer.postalCode}</td></tr>
								<tr><td><strong>Country:</strong></td><td>${customer.country}</td></tr>
								<tr>
									<td><strong>Billing Address:</strong></td>
									<td>${customer.billingSameAsShipping ? 'Same as Shipping' : 'Different'}</td>
								</tr>
							</table>

							${
								billingAddress
									? `
							<hr style="margin:15px 0; border:none; border-top:1px solid #eee;" />
							<h4 style="margin:0 0 8px; color:#5DABEA;">Billing Address Details</h4>
							<table width="100%" cellpadding="4" cellspacing="0">
								<tr><td><strong>Phone:</strong></td><td>${billingAddress.phone || ''}</td></tr>
								<tr><td><strong>Address:</strong></td><td>${billingAddress.address}</td></tr>
								<tr><td><strong>City:</strong></td><td>${billingAddress.city}</td></tr>
								<tr><td><strong>Postal Code:</strong></td><td>${
									billingAddress.postalCode
								}</td></tr>
							</table>
							`
									: ''
							}
						</td>
					</tr>

					<!-- Order Items -->
					<tr>
						<td style="padding-top:20px;">
							<h3 style="margin-bottom:10px; color:#E95CA7;">Order Items</h3>
							<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
								<tr style="border-bottom:2px solid #5DABEA;">
									<th align="left" style="padding:8px 0;">Item</th>
									<th align="left" style="padding:8px 0;">SKU</th>
									<th align="center" style="padding:8px 0;">Qty</th>
									<th align="right" style="padding:8px 0;">Price</th>
								</tr>
								${itemsHtml}
							</table>
						</td>
					</tr>

					<!-- Payment Summary -->
					<tr>
						<td style="padding-top:20px;">
							<table width="100%" cellpadding="4" cellspacing="0">
								<tr>
									<td><strong>Payment Method:</strong></td>
									<td align="right">${paymentMethod?.toLocaleUpperCase()}</td>
								</tr>
								<tr>
									<td><strong>Shipping Free:</strong></td>
									<td align="right">Rs ${shipping}</td>
								</tr>
								<tr style="margin-top:8px;">
									<td style="color:#5DABEA; font-weight:bold;">Total Amount</td>
									<td align="right" style="font-weight:bold; color:#5DABEA;">
										Rs ${total}
									</td>
								</tr>
							</table>
						</td>
					</tr>

				

					<!-- Footer -->
					<tr>
						<td align="center" style="font-size:12px; color:#888;">
							Copyright © ${new Date().getFullYear()} B. Babies n Baba. All rights reserved
						</td>
					</tr>

				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`;
};

module.exports = { orderConfirmationAdminTemplate };

// <!-- CTA -->
// 				<tr>
// 					<td align="center" style="padding:30px 0;">
// 						<a href="https://your-admin-panel.com/orders/${orderId}"
// 						   target="_blank"
// 						   style="background:#E95CA7; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold;">
// 							View Order in Admin Panel
// 						</a>
// 					</td>
// 				</tr>
