import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import api from "../services/api";
import { Link } from "react-router-dom";

interface Notification {
  _id: string;
  type: 'contract_expiry' | 'contract_overdue' | 'system';
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    contractId?: string;
  };
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button" 
        aria-label="Notifications"
        className="hover:text-[#F26323] transition-colors relative p-2"
        title="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={21} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[11px] text-[#F26323] font-bold hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n._id}
                  className={`p-4 border-b border-gray-50 transition-colors hover:bg-gray-50 flex gap-3 group relative ${!n.isRead ? 'bg-orange-50/30' : ''}`}
                >
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-[#F26323]' : 'bg-transparent'}`} />
                  <div className="flex-1">
                    <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {n.message}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-gray-400">{formatTime(n.createdAt)}</span>
                      {n.metadata?.contractId && (
                        <Link 
                          to="/client/contracts" 
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] text-[#F26323] font-bold hover:underline"
                        >
                          View Contract
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n._id)}
                        className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(n._id)}
                      className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                <p className="text-[11px] text-gray-400 mt-1">We'll alert you here for important updates.</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 font-medium hover:text-[#F26323] transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}