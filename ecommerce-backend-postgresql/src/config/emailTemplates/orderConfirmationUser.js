const orderConfirmationCustomerTemplate = ({
	orderId,
	customerName,
	items,
	subtotal,
	shipping,
	total,
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
							<h2 style="margin:0 0 10px; color:#5DABEA;">Thank you for your order 🎉</h2>
							<p style="margin:0 0 20px; color:#333;">
								Hi <strong>${customerName}</strong>,<br/>
								Your order <strong>${orderId}</strong> has been placed successfully.
							</p>
						</td>
					</tr>

					<!-- Order Summary -->
					<tr>
						<td>
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
									<td>Shipping Fee</td>
									<td align="right">Rs ${shipping}</td>
								</tr>
								<tr style="margin-top:8px;">
									<td style="color:#5DABEA; font-weight:bold;">Total</td>
									<td align="right" style="font-weight:bold; color:#5DABEA;">
										Rs ${total}
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr>
						<td style="padding-top:15px; font-size:13px; color:#555;">
							You can review our 
							<a href="https://babiesnbaba.com/return-and-exchange" target="_blank" style="color:#5DABEA; text-decoration:none;">
								Return & Exchange Policy
							</a> 
							for details on returns, exchanges, and eligibility.
						</td>
					</tr>
					<!-- CTA Button -->
					<tr>
						<td align="center" style="padding:30px 0;">
							<a href="https://babiesnbaba.com/order-tracking?id=${orderId}" target="_blank"
								style="background:#5DABEA; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; display:inline-block; font-weight:bold;">
								View Your Order
							</a>
						</td>
					</tr>
				

					<!-- Footer Message -->
					<tr>
						<td style="padding-top:20px; color:#555;">
							<p style="margin:0;">
								We'll contact you once your order is shipped.<br/>
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

module.exports = { orderConfirmationCustomerTemplate };
