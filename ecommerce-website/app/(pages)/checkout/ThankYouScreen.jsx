import BasePrice from "@/app/components/BaseComponents/BasePrice";
import { useEffect } from "react";

function ThankYouScreen({ order, paymentLabelMap }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border p4">
      <h2 className="h3 font-semibold mb-2 text-primary">
        🎉 Thank you for your order!
      </h2>

      <p className="text-gray-600 mb-6">
        Your order has been placed successfully. We&apos;ll contact you shortly.
      </p>

      <div className="border rounded-md p-4 mb-6 bg-gray-50">
        <p className="text-sm text-gray-500">Order ID</p>
        <p className="font-medium">{order.orderId}</p>
      </div>

			{/* ORDER ITEMS */}
			<div className="space-y-4 mb-6">
				{order.items.map((item, idx) => (
					<div key={`item-${idx}`} className="flex justify-between">
						<div>
							<p className="font-medium">{item.title}</p>
							<p className="text-sm text-gray-500">Sku: {item.sku||'-'}</p>
							<p className="text-sm text-gray-500">Qty: {item.quantity}</p>
						</div>
						<BasePrice price={item.finalPrice} />
					</div>
				))}
			</div>

      {/* SUMMARY */}
      <div className="border-t pt-4 space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <BasePrice price={order.summary.subtotal} />
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <BasePrice price={order.summary.shipping} />
        </div>
        <h4 className="flex justify-between font-medium">
          <span>Total</span>
          <BasePrice price={order.summary.total} />
        </h4>
      </div>

      {/* PAYMENT METHOD */}
      <div className="border rounded-md p-4 bg-secondary/10">
        <p className="text-sm text-gray-500 mb-1">Payment Method</p>
        <p className="font-medium">{paymentLabelMap[order.paymentMethod]}</p>
      </div>
    </div>
  );
}

export default ThankYouScreen;
