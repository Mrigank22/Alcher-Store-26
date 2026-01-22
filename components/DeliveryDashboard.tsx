"use client";
import React, { useState, useEffect } from 'react';

// Define the Order type based on the relevant fields from Order.ts
interface Order {
  _id: string;
  orderId: string;
  items: {
    productName: string;
    quantity: number;
    size: string;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'sbi' | 'cod';
  totalAmount: number;
  orderDate: string;
  notes?: string;
}

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/confirmed'); 
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const exportToCSV = () => {
    const headers = [
      'Order ID',
      'Customer Name',
      'Phone',
      'Address',
      'City',
      'Pincode',
      'Payment Method',
      'Total Amount',
      'Order Date',
      'Items',
      'Notes',
    ];

    const rows = orders.map(order => [
      order.orderId,
      order.shippingAddress.name,
      order.shippingAddress.phone,
      `${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}`,
      order.shippingAddress.city,
      order.shippingAddress.pincode,
      order.paymentMethod,
      order.totalAmount,
      new Date(order.orderDate).toLocaleDateString(),
      order.items.map(item => `${item.productName} (Qty: ${item.quantity}, Size: ${item.size || 'N/A'})`).join('; '),
      order.notes || '',
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "confirmed_orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Confirmed Orders for Delivery</h1>
        <button
          onClick={exportToCSV}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Shipping Address</th>
              <th className="py-2 px-4 border-b">Items</th>
              <th className="py-2 px-4 border-b">Payment</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Notes</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td className="py-2 px-4 border-b">{order.orderId}</td>
                <td className="py-2 px-4 border-b">
                  <div>{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.phone}</div>
                </td>
                <td className="py-2 px-4 border-b">
                  {`${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 || ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`}
                </td>
                <td className="py-2 px-4 border-b">
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>{`${item.productName} (x${item.quantity}) - Size: ${item.size || 'N/A'}`}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 px-4 border-b">
                    <div>{order.paymentMethod.toUpperCase()}</div>
                    <div>₹{order.totalAmount.toFixed(2)}</div>
                </td>
                <td className="py-2 px-4 border-b">{new Date(order.orderDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{order.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
