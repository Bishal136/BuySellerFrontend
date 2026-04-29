import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiShoppingBag, FiDownload, FiHome } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    // Implement PDF download functionality
    toast.success('Invoice download started');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600">Order ID: <span className="font-mono">{order?._id}</span></p>
            <p className="text-sm text-gray-600">Order Date: {new Date(order?.createdAt).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Payment Method: {order?.paymentMethod}</p>
            <p className="text-sm text-gray-600">Total Amount: <span className="font-bold text-primary-600">${order?.totalPrice?.toFixed(2)}</span></p>
          </div>
          
          <div className="space-y-3">
            <Link to={`/orders/${order?._id}`} className="btn-primary w-full flex items-center justify-center">
              <FiShoppingBag className="mr-2" /> View Order Details
            </Link>
            <button onClick={downloadInvoice} className="btn-secondary w-full flex items-center justify-center">
              <FiDownload className="mr-2" /> Download Invoice
            </button>
            <Link to="/" className="text-primary-600 hover:text-primary-700 flex items-center justify-center">
              <FiHome className="mr-2" /> Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;