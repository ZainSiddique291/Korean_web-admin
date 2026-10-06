import { useState } from 'react';
import { Search, Users, Mail, Phone, MapPin, DollarSign, ShoppingBag } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function CustomersPage() {
  const { customers } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const nameStr = c.name || '';
    const emailStr = c.email || '';
    const cityStr = c.city || '';
    return (
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cityStr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Customer Directory ({filteredCustomers.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registered customer accounts, purchasing history, and shipping destinations
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="card-admin p-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, email address, city..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-admin p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4 text-right">Latest Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, idx) => (
                  <tr key={cust.email || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-800 font-bold text-xs flex items-center justify-center shrink-0 border border-primary-200">
                          {cust.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{cust.name}</div>
                          <div className="text-[11px] text-slate-400">{cust.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {cust.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {cust.city || 'Lahore'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {cust.orderCount || 0} orders
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ${Number(cust.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                      {cust.latestOrderDate ? new Date(cust.latestOrderDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
