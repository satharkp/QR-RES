import { useState, useEffect } from "react";
import { fetchOrderById } from "../services/api";

const OrderTracker = () => {
  const [order, setOrder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const orderId = localStorage.getItem("lastOrderId");

  useEffect(() => {
    if (!orderId) return;

    const getOrder = async () => {
      try {
        const data = await fetchOrderById(orderId);
        if (data && data._id) {
          setOrder(data);
          // Only show tracker if order is not yet SERVED
          if (data.status !== "SERVED") {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }
      } catch (err) {
        console.error("Order tracker fetch failed", err);
      }
    };

    getOrder();
    const interval = setInterval(getOrder, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  if (!isVisible || !order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED": return "bg-blue-500";
      case "PREPARING": return "bg-orange-500";
      case "READY": return "bg-greenleaf-secondary";
      case "PENDING_CONFIRMATION": return "bg-gray-400";
      default: return "bg-greenleaf-primary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PLACED": return "Order Confirmed";
      case "PREPARING": return "Kitchen Preparing";
      case "READY": return "Ready for Pickup/Service";
      case "PENDING_CONFIRMATION": return "Waiting for Waiter";
      default: return status.replace("_", " ");
    }
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-floating border border-greenleaf-accent p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${getStatusColor(order.status)} flex items-center justify-center text-white shadow-sm`}>
          <span className="text-xl">
            {order.status === "READY" ? "🔔" : order.status === "PREPARING" ? "🔥" : "⏳"}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="bg-greenleaf-bg text-greenleaf-primary text-[8px] font-black px-1.5 py-0.5 rounded-md border border-greenleaf-accent uppercase">Table {order.tableNumber}</span>
            <h4 className="text-[10px] uppercase font-black tracking-widest text-greenleaf-muted">Order Status</h4>
          </div>
          <p className="text-sm font-bold text-greenleaf-text">{getStatusText(order.status)}</p>
        </div>

        <div className="text-right border-l border-greenleaf-accent pl-4">
          <h4 className="text-[10px] uppercase font-black tracking-widest text-greenleaf-muted mb-0.5">Wait Time</h4>
          <p className="text-sm font-black text-greenleaf-primary">
            {order.estimatedWaitTime || 15} <span className="text-[8px] font-normal italic">mins</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
