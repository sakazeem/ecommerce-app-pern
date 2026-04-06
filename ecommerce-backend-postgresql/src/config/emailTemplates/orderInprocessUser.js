const orderInProcessCustomerTemplate = ({
	orderId,
	customerName,
	items,
	subtotal,
	shipping,
	total,
	tracking_id,
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
						<td align="center" style="padding-bottom:20px;">
							<a href="https://babiesnbaba.com" target="_blank">
								<img src="https://babiesnbaba.com/logo.png" alt="B. Babies n Baba" width="175" style="display:block;"/>
							</a>
						</td>
					</tr>

					<!-- Header -->
					<tr>
						<td>
							<h2 style="margin:0 0 10px; color:#5DABEA;">Your Order is Being Processed ⏳</h2>
							<p style="margin:0 0 20px; color:#333;">
								Hi <strong>${customerName}</strong>,<br/>
								Your order <strong>${orderId}</strong> is currently being prepared.
							</p>
						</td>
					</tr>

					<!-- Message -->
					<tr>
						<td style="color:#555; font-size:14px; line-height:1.6;">
							We are packing your items and getting them ready for shipment. 
							You will receive another update once your order has been shipped.
						</td>
					</tr>

					<!-- Order Summary -->
					<tr>
						<td style="padding-top:20px;">
							<h3 style="margin-bottom:10px; color:#E95CA7;">Order Summary</h3>
							<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
								<tr style="border-bottom:2px solid #5DABEA;">
									<th align="left" style="padding:8px 0;">Item</th>
									<th align="left" style="padding:8px 0;">Sku</th>
									<th align="center" style="padding:8px 0;">Qty</th>
									<th align="right" style="padding:8px 0;">Price</th>
								</tr>
								${itemsHtml}
							</table>
						</td>
					</tr>

					<!-- Totals -->
					<tr>
						<td style="padding-top:20px;">
							<table width="100%" cellpadding="2" cellspacing="0">
								<tr>
									<td>Subtotal</td>
									<td align="right">Rs ${subtotal}</td>
								</tr>
								<tr>
									<td>Shipping</td>
									<td align="right">Rs ${shipping}</td>
								</tr>
								<tr>
									<td style="color:#5DABEA; font-weight:bold;">Total</td>
									<td align="right" style="font-weight:bold; color:#5DABEA;">
										Rs ${total}
									</td>
								</tr>
							</table>
						</td>
					</tr>

					<!-- CTA -->
					<tr>
						<td align="center" style="padding:30px 0;">
							<a href="https://cclpak.com/tracking?trackingno=${tracking_id}" target="_blank"
								style="background:#5DABEA; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; display:inline-block; font-weight:bold;">
								Track Your Order
							</a>
						</td>
					</tr>

					<!-- Footer Message -->
					<tr>
						<td style="color:#555;">
							<p style="margin:0;">
								Thanks for your patience!<br/>
								If you have any questions, just reply to this email.
							</p>
						</td>
					</tr>

					<!-- Footer -->
					<tr>
						<td style="padding-top:30px; font-size:12px; color:#888;" align="center">
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
module.exports = { orderInProcessCustomerTemplate };
