import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  HiOutlineShoppingBag, 
  HiOutlineCheckCircle, 
  HiOutlinePlay, 
  HiOutlineTruck, 
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineFire,
  HiOutlineDeviceTablet,
  HiOutlineLogout
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { orderAPI } from '../../services/api';
import { socketService } from '../../services/socket';
import useAuthStore from '../../store/authStore';
import { PageLoader } from '../../components/LoadingSpinner';
import AdminNav from '../../components/AdminNav';
import { formatPrice } from '../../utils/formatPrice';

const COLUMNS = [
  { id: 'pending', title: 'Đơn mới', icon: <HiOutlineShoppingBag />, color: 'yellow' },
  { id: 'confirmed', title: 'Xác nhận', icon: <HiOutlineCheckCircle />, color: 'blue' },
  { id: 'preparing', title: 'Chế biến', icon: <HiOutlinePlay />, color: 'purple' },
  { id: 'ready', title: 'Chờ giao', icon: <HiOutlineTruck />, color: 'orange' },
  { id: 'delivered', title: 'Hoàn tất', icon: <HiOutlineCheck />, color: 'green' },
];

const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  preparing: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  ready: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const NEXT_ACTIONS = {
  pending: { label: 'Xác nhận', next: 'confirmed', color: 'bg-blue-600' },
  confirmed: { label: 'Chế biến', next: 'preparing', color: 'bg-purple-600' },
  preparing: { label: 'Xong', next: 'ready', color: 'bg-orange-600' },
  ready: { label: 'Giao hàng', next: 'delivered', color: 'bg-green-600' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kitchenMode, setKitchenMode] = useState(false);
  const { user } = useAuthStore();

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await orderAPI.getAllAdmin({ limit: 100 });
      setOrders(data.data);
    } catch (err) {
      toast.error('Không thể tổi danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Socket listeners
    if (user) {
      socketService.connect(localStorage.getItem('accessToken'));
      socketService.on('order:new', (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
        toast.success(`Có đơn hàng mới: #${newOrder.orderNumber || newOrder._id.slice(-6)}`, {
          icon: '🍕',
          duration: 5000,
        });
        // Play notification sound
        new Audio('/sounds/notification.mp3').play().catch(() => {});
      });

      socketService.on('order:updated', (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      });
    }

    return () => socketService.disconnect();
  }, [user, fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      // Optimistic update handled by socket or fetch
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
      fetchOrders(); // Rollback
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const order = orders.find(o => o._id === draggableId);

    // Validate logic transitions if needed (backend will also validate)
    updateStatus(draggableId, newStatus);
  };

  const stats = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    return {
      count: todayOrders.length,
      revenue: todayOrders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.totalPrice, 0),
      cancelled: todayOrders.filter(o => o.status === 'cancelled').length,
    };
  }, [orders]);

  if (loading) return <PageLoader />;

  return (
    <div className={`pt-24 pb-16 min-h-screen transition-all ${kitchenMode ? 'bg-[#0f172a]' : ''}`}>
      <div className={kitchenMode ? 'px-4 max-w-[1920px] mx-auto' : 'page-container'}>
        {!kitchenMode && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="section-title">Quản Lý <span className="gradient-text">Đơn Hàng</span></h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">Giao diện Kanban thời gian thực</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-4 px-4 py-2 glass-strong rounded-2xl border border-white/10">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-blue-400">Đơn hôm nay</p>
                  <p className="text-xl font-black">{stats.count}</p>
                </div>
                <div className="w-px bg-white/10 my-1" />
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-green-400">Doanh thu</p>
                  <p className="text-xl font-black">{formatPrice(stats.revenue)}</p>
                </div>
              </div>
              <button 
                onClick={() => setKitchenMode(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-900/20"
              >
                <HiOutlineDeviceTablet className="w-5 h-5" /> Kitchen Mode
              </button>
            </div>
          </div>
        )}

        {kitchenMode && (
          <div className="flex items-center justify-between mb-8 py-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-purple-400 tracking-tighter uppercase italic">KITCHEN DISPLAY SYSTEM</h2>
              <div className="px-3 py-1 bg-white/5 rounded-lg text-xs font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <button 
              onClick={() => setKitchenMode(false)}
              className="flex items-center gap-2 text-white/60 hover:text-white px-4 py-2 rounded-xl transition-all"
            >
              <HiOutlineLogout className="w-5 h-5" /> Thoát
            </button>
          </div>
        )}

        {!kitchenMode && <AdminNav />}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className={`flex gap-6 overflow-x-auto pb-8 scrollbar-hide select-none`}>
            {COLUMNS.map(col => {
              const columnOrders = orders.filter(o => o.status === col.id);
              if (kitchenMode && (col.id === 'pending' || col.id === 'delivered')) return null;

              return (
                <div key={col.id} className="min-w-[320px] flex-1">
                  <div className={`flex items-center justify-between mb-4 px-2`}>
                    <div className="flex items-center gap-2">
                       <div className={`p-2 rounded-lg bg-${col.color}-500/10 text-${col.color}-400`}>
                        {col.icon}
                       </div>
                       <h3 className="font-bold text-white uppercase tracking-wider text-sm">{col.title}</h3>
                       <span className="bg-white/10 text-[10px] px-2 py-0.5 rounded-full font-bold">{columnOrders.length}</span>
                    </div>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[600px] p-2 rounded-2xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : 'bg-transparent'}`}
                      >
                        <AnimatePresence initial={false}>
                          {columnOrders.map((order, index) => (
                            <OrderCard 
                              key={order._id} 
                              order={order} 
                              index={index} 
                              updateStatus={updateStatus}
                              isKitchen={kitchenMode}
                            />
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

function OrderCard({ order, index, updateStatus, isKitchen }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(order.createdAt)) / 1000 / 60));
    }, 10000);
    return () => clearInterval(timer);
  }, [order.createdAt]);

  const isUrgent = (order.status === 'pending' && elapsed > 5) || (order.status === 'preparing' && elapsed > 15);
  const action = NEXT_ACTIONS[order.status];

  return (
    <Draggable draggableId={order._id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-4 relative group ${snapshot.isDragging ? 'z-50' : ''}`}
        >
          <div className={`glass-strong rounded-2xl p-4 border border-white/10 transition-all ${snapshot.isDragging ? 'shadow-2xl shadow-black/50 rotate-2' : 'hover:border-white/20'} ${isUrgent ? 'ring-2 ring-red-500/50' : ''}`}>
            {isUrgent && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 animate-bounce shadow-lg z-10">
                <HiOutlineFire className="w-4 h-4" />
              </div>
            )}

            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-black text-lg">#{order.orderNumber || order._id.slice(-6)}</h4>
                <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                  {order.user?.name || 'Khách vãng lai'}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-[var(--color-primary)] font-black">{formatPrice(order.totalPrice)}</p>
                <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                  <HiOutlineClock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: vi })}
                </div>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                  <span className="text-white/80 font-medium">
                    <span className="text-[var(--color-primary)] font-bold">x{item.quantity}</span> {item.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {action && (
                <button 
                  onClick={() => updateStatus(order._id, action.next)}
                  className={`flex-1 py-2 rounded-xl text-white text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 ${action.color} shadow-lg`}
                >
                  {action.label}
                </button>
              )}
              {!isKitchen && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button 
                  onClick={() => updateStatus(order._id, 'cancelled')}
                  className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs transition-colors"
                >
                  Huỷ
                </button>
              )}
            </div>
            
            {order.note && (
              <div className="mt-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-400">
                <span className="font-bold">📝 Ghi chú:</span> {order.note}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Draggable>
  );
}
