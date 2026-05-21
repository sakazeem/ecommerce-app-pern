const orderDeliveredReviewTemplate = ({ customerName, trackingId, reviewUrl }) => {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px; margin:0;">
	<table width="100%" cellpadding="0" cellspacing="0">
		<tr>
			<td align="center">
				<table width="600" style="background:#ffffff; padding:24px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

					<tr>
						<td align="center" style="padding-bottom:20px;">
							<a href="https://babiesnbaba.com" target="_blank" style="text-decoration:none;">
								<img src="https://babiesnbaba.com/logo.png" alt="Babies n Baba" width="175" style="display:block;"/>
							</a>
						</td>
					</tr>

					<tr>
						<td style="padding-bottom:16px;">
							<h2 style="margin:0; color:#333; font-size:22px;">How was your order, ${customerName}?</h2>
						</td>
					</tr>

					<tr>
						<td style="color:#555; font-size:15px; line-height:1.6; padding-bottom:24px;">
							<p style="margin:0 0 12px;">Your order <strong>#${trackingId}</strong> has been delivered! We hope you love your purchase.</p>
							<p style="margin:0;">Your feedback helps us improve and helps other shoppers make better decisions. It only takes a minute!</p>
						</td>
					</tr>

					<tr>
						<td align="center" style="padding-bottom:28px;">
							<a href="${reviewUrl}"
								target="_blank"
								style="display:inline-block; background:#333333; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:6px; font-size:15px; font-weight:bold;">
								Write a Review
							</a>
						</td>
					</tr>

					<tr>
						<td style="color:#999; font-size:12px; border-top:1px solid #eee; padding-top:16px;">
							This link is unique to your order. No account required.
						</td>
					</tr>

				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
};

module.exports = { orderDeliveredReviewTemplate };
