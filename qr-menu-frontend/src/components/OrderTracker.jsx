import { useState, useEffect } from "react";
import { fetchOrderById, SOCKET_URL } from "../services/api";
import { io } from "socket.io-client";

const OrderTracker = () => {
  const [order, setOrder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState(null);
  const orderId = localStorage.getItem("lastOrderId");

  useEffect(() => {
    console.log("DEBUG: OrderTracker mounted. orderId:", orderId);
  }, []);

  const getOrder = async () => {
    if (!orderId) {
      console.log("DEBUG: No orderId in localStorage");
      return;
    }

    try {
      console.log("DEBUG: Fetching order:", orderId);
      const data = await fetchOrderById(orderId);
      console.log("DEBUG: Received data:", data);

      if (data && data._id) {
        setOrder(data);
        if (data.status !== "SERVED") {
          setIsVisible(true);
          if (timeLeft === 0 || Math.abs(data.estimatedWaitTime - timeLeft) > 2) {
            setTimeLeft(data.estimatedWaitTime || 15);
          }
        } else {
          setIsVisible(false);
          console.log("DEBUG: Order already served.");
        }
      } else {
        setError("Invalid order data received");
        console.error("DEBUG: Invalid order data", data);
      }
    } catch (err) {
      setError(err.message);
      console.error("DEBUG: Order tracker fetch failed", err);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    getOrder();
    const pollInterval = setInterval(getOrder, 15000);
    return () => clearInterval(pollInterval);
  }, [orderId]);

  useEffect(() => {
    if (!order?.restaurantId || !orderId) return;

    const socket = io(SOCKET_URL);
    socket.emit("joinRestaurant", order.restaurantId);

    socket.on("connect", () => console.log("DEBUG: Socket Connected"));
    socket.on("order-updated", (updatedOrder) => {
      console.log("DEBUG: Order update received via socket:", updatedOrder);
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

  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000);
    return () => clearInterval(timer);
  }, [isVisible, timeLeft]);

  // If we have an ID but not loaded yet, or fetching, show a small hint
  if (!isVisible && !orderId) return null;

  if (!isVisible && orderId && !error) {
    return (
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[9999] bg-white/80 backdrop-blur shadow-sm px-4 py-1 rounded-full text-[8px] uppercase font-black text-greenleaf-muted opacity-50">
        Checking your order status...
      </div>
    );
  }

  if (error && orderId) {
    return (
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[9999] bg-red-50 backdrop-blur shadow-sm px-4 py-1 rounded-full text-[8px] uppercase font-black text-red-400">
        Sync Error: {error}
      </div>
    );
  }

  if (!order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED": return "bg-blue-600 shadow-lg shadow-blue-600/20";
      case "PREPARING": return "bg-orange-500 animate-pulse";
      case "READY": return "bg-green-600 shadow-xl shadow-green-600/40";
      case "PENDING_CONFIRMATION": return "bg-gray-500 font-black";
      default: return "bg-greenleaf-primary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PLACED": return "Kitchen Confirmed";
      case "PREPARING": return "Cooking in Progress";
      case "READY": return "Ready for Service!";
      case "PENDING_CONFIRMATION": return "Waiting for Waiter";
      case "SERVED": return "Served";
      default: return status.replace("_", " ");
    }
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-5 duration-700">
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-greenleaf-accent p-5 flex items-center gap-5">
        <div className={`w-16 h-16 rounded-[1.25rem] ${getStatusColor(order.status)} flex items-center justify-center text-white transition-all duration-700`}>
          <span className="text-3xl">
            {order.status === "READY" ? "!" : order.status === "PREPARING" ? "C" : "W"}
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-greenleaf-bg text-greenleaf-primary text-[10px] font-black px-2.5 py-1 rounded-xl border border-greenleaf-accent uppercase">Table {order.tableNumber}</span>
            <span className="w-1.5 h-1.5 bg-greenleaf-accent rounded-full"></span>
            <h4 className="text-[10px] uppercase font-black tracking-widest text-greenleaf-muted opacity-40">Live Status</h4>
          </div>
          <p className="text-xl font-serif font-black text-greenleaf-text tracking-tight truncate">
            {getStatusText(order.status)}
          </p>
        </div>

        <div className="text-right border-l border-greenleaf-accent pl-6 flex flex-col items-end">
          <h4 className="text-[10px] uppercase font-black tracking-widest text-greenleaf-muted opacity-40 mb-1">Estimate</h4>
          <p className="text-2xl font-serif font-black text-greenleaf-primary flex items-baseline gap-1">
            {timeLeft} <span className="text-xs font-normal italic opacity-40">mins</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
