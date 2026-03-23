import { useState, useEffect } from "react";
import { fetchOrderById, SOCKET_URL } from "../services/api";
import { io } from "socket.io-client";

const OrderTracker = () => {
  const [order, setOrder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const orderId = localStorage.getItem("lastOrderId");

  const getOrder = async () => {
    if (!orderId) return;
    try {
      const data = await fetchOrderById(orderId);
      if (data && data._id) {
        setOrder(data);
        // Show tracker for any status except SERVED
        if (data.status !== "SERVED") {
          setIsVisible(true);
          // Sync wait time if it's the first load or kitchen updated it
          if (timeLeft === 0 || Math.abs(data.estimatedWaitTime - timeLeft) > 2) {
            setTimeLeft(data.estimatedWaitTime || 15);
          }
        } else {
          setIsVisible(false);
        }
      }
    } catch (err) {
      console.error("Order tracker fetch failed", err);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setIsVisible(false);
      return;
    }

    getOrder();
    const pollInterval = setInterval(getOrder, 15000); // 15s fallback poll

    return () => clearInterval(pollInterval);
  }, [orderId]);

  // Socket.io for immediate updates
  useEffect(() => {
    if (!order?.restaurantId || !orderId) return;

    const socket = io(SOCKET_URL);
    socket.emit("joinRestaurant", order.restaurantId);

    socket.on("order-updated", (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
        if (updatedOrder.status === "SERVED") {
          setIsVisible(false);
        } else {
          setIsVisible(true);
          setTimeLeft(updatedOrder.estimatedWaitTime);
        }
      }
    });

    return () => socket.disconnect();
  }, [order?.restaurantId, orderId]);

  // Local Countdown Timer (decrements every minute)
  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000);

    return () => clearInterval(timer);
  }, [isVisible, timeLeft]);

  if (!isVisible || !order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED": return "bg-blue-600 shadow-lg shadow-blue-600/20";
      case "PREPARING": return "bg-orange-500 animate-pulse";
      case "READY": return "bg-green-600 shadow-xl shadow-green-600/40";
      case "PENDING_CONFIRMATION": return "bg-gray-500";
      default: return "bg-greenleaf-primary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PLACED": return "Confirmed";
      case "PREPARING": return "In Preparation";
      case "READY": return "Ready for You!";
      case "PENDING_CONFIRMATION": return "Waiting for Waiter";
      default: return status.replace("_", " ");
    }
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[999] animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-greenleaf-accent p-4 flex items-center gap-4">
        {/* Status Icon */}
        <div className={`w-14 h-14 rounded-2xl ${getStatusColor(order.status)} flex items-center justify-center text-white transition-all duration-700`}>
          <span className="text-2xl">
            {order.status === "READY" ? "�️" : order.status === "PREPARING" ? "�‍🍳" : "🕒"}
          </span>
        </div>

        {/* Order Details */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="bg-greenleaf-bg text-greenleaf-primary text-[9px] font-black px-2 py-0.5 rounded-lg border border-greenleaf-accent uppercase">Table {order.tableNumber}</span>
            <span className="w-1 h-1 bg-greenleaf-accent rounded-full"></span>
            <h4 className="text-[9px] uppercase font-black tracking-widest text-greenleaf-muted opacity-50">Status</h4>
          </div>
          <p className="text-lg font-serif font-black text-greenleaf-text tracking-tight truncate">
            {getStatusText(order.status)}
          </p>
        </div>

        {/* Wait Time Estimate */}
        <div className="text-right border-l border-greenleaf-accent pl-5 flex flex-col items-end">
          <h4 className="text-[9px] uppercase font-black tracking-widest text-greenleaf-muted opacity-50 mb-0.5">Wait Time</h4>
          <p className="text-xl font-serif font-black text-greenleaf-primary flex items-baseline gap-1">
            {timeLeft} <span className="text-[9px] font-normal italic opacity-50">mins</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
