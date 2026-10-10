import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import StatCard from '../components/StatCard';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Modal from '../components/Modal';

export default function DashboardPage() {
  const { stats, orders, products, customers, refreshAllData, isSyncing, updateOrderStatus } = useAdmin();
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fallbacks if stats object is still hydrating
  const totalRevenue = stats?.totalRevenue ?? orders.reduce((sum, ord) => sum + Number(ord.total || 0), 0);
  const totalOrders = stats?.totalOrders ?? orders.length;
  const totalProducts = stats?.totalProducts ?? products.length;
  const totalCustomers = stats?.totalCustomers ?? customers.length;

  const deliveredCount = stats?.deliveredCount ?? orders.filter((o) => o.status === 'Delivered').length;
  const processingCount = stats?.processingCount ?? orders.filter((o) => o.status === 'Processing').length;
  const shippedCount = stats?.shippedCount ?? orders.filter((o) => o.status === 'Shipped').length;
  const cancelledCount = stats?.cancelledCount ?? orders.filter((o) => o.status === 'Cancelled').length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card-admin bg-gradient-to-r from-primary-900 to-primary-800 text-white border-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-800 text-emerald-300 border border-primary-700 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Central Database
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
            Administrative Overview
          </h2>
          <p className="text-xs sm:text-sm text-primary-200 mt-1 max-w-xl">
            Live overview of products, customer purchases, order dispatching pipeline, and revenue metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/products" className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4">
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Link>
          <button
            onClick={refreshAllData}
            disabled={isSyncing}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm py-2 px-3 sm:px-4"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="emerald"
          trend="Realized Revenue"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          color="blue"
          trend={`${processingCount} in pipeline`}
        />
        <StatCard
          title="Active Products"
          value={totalProducts}
          icon={Package}
          color="amber"
          trend={`${stats?.totalStock ?? 'Live'} stock units`}
        />
        <StatCard
          title="Customers Directory"
          value={totalCustomers}
          icon={Users}
          color="purple"
          trend="Verified Accounts"
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="card-admin">
        <h3 className="text-base font-bold text-slate-900 mb-4 font-serif">Order Pipeline Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4" /> Processing
            </div>
            <div className="text-2xl font-bold text-purple-900">{processingCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold mb-1">
              <Truck className="w-4 h-4" /> Shipped
            </div>
            <div className="text-2xl font-bold text-blue-900">{shippedCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" /> Delivered
            </div>
            <div className="text-2xl font-bold text-emerald-900">{deliveredCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold mb-1">
              <AlertCircle className="w-4 h-4" /> Cancelled
            </div>
            <div className="text-2xl font-bold text-rose-900">{cancelledCount}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card-admin">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 font-serif">Recent Live Orders</h3>
          <Link to="/orders" className="text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentOrders.map((ord) => {
                  const id = ord.orderId || ord.id || ord._id;
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {String(id).slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{ord.customer?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400">{ord.customer?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {ord.products?.length || 1} item(s)
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        ${Number(ord.total || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {ord.paymentMethod || 'COD'}
                      </td>
                      <td className="py-3.5 px-4">
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="btn-secondary py-1.5 px-2.5 text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${String(selectedOrder?.orderId || selectedOrder?.id || selectedOrder?._id || '').slice(-8).toUpperCase()}`}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer</span>
                <span className="font-semibold text-slate-800">{selectedOrder.customer?.name}</span>
                <span className="text-slate-500 block">{selectedOrder.customer?.email}</span>
                <span className="text-slate-500 block">{selectedOrder.customer?.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Shipping Destination</span>
                <span className="font-semibold text-slate-800">{selectedOrder.customer?.city || 'Lahore'}</span>
                <span className="text-slate-500 block">{selectedOrder.customer?.address}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2">Ordered Items</h4>
              <div className="space-y-2">
                {selectedOrder.products?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.thumbnail || item.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100'}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100';
                        }}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-100"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">{item.title}</div>
                        <div className="text-slate-400 text-[11px]">Qty: {item.quantity || 1} × ${Number(item.price || 0).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      ${((item.quantity || 1) * Number(item.price || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-800">Total Amount:</span>
              <span className="text-base font-bold text-emerald-700">
                ${Number(selectedOrder.total || 0).toFixed(2)}
              </span>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Update Order Status (Live Atlas)
              </label>
              <select
                value={selectedOrder.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const targetId = selectedOrder._id || selectedOrder.id;
                  await updateOrderStatus(targetId, newStatus);
                  setSelectedOrder({ ...selectedOrder, status: newStatus });
                }}
                className="input-field text-xs"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
