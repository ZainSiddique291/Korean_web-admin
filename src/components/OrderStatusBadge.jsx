export default function OrderStatusBadge({ status }) {
  const getBadgeStyle = (s) => {
    switch (s) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {status || 'Pending'}
    </span>
  );
}
