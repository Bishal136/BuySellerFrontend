import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMessageSquare, FiSend, FiUser, FiMail, 
  FiPaperclip, FiCheckCircle, FiClock, FiSearch
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
    fetchCustomers();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/seller/messages');
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/seller/orders');
      const uniqueCustomers = [...new Map(response.data.orders.map(order => 
        [order.customer?._id, order.customer]
      )).values()];
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer) return;
    
    try {
      await api.post('/seller/messages', {
        receiverId: selectedCustomer._id,
        subject: subject || 'Customer Inquiry',
        message: newMessage
      });
      toast.success('Message sent');
      setNewMessage('');
      setSubject('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getConversation = (customerId) => {
    return messages.filter(msg => 
      msg.sender?._id === customerId || msg.receiver?._id === customerId
    );
  };

  const filteredCustomers = customers.filter(customer =>
    customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Customer Messages</h1>
        <p className="text-gray-600">Communicate with your customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {filteredCustomers.map((customer) => {
              const conversation = getConversation(customer._id);
              const unreadCount = conversation.filter(m => !m.isRead && m.receiver?._id === customer._id).length;
              
              return (
                <button
                  key={customer._id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedCustomer?._id === customer._id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{customer.name}</p>
                      <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {filteredCustomers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No customers found
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col h-[600px]">
          {selectedCustomer ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {getConversation(selectedCustomer._id).map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender?._id === selectedCustomer._id ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender?._id === selectedCustomer._id
                        ? 'bg-gray-100'
                        : 'bg-primary-600 text-white'
                    }`}>
                      <p className="text-sm font-medium mb-1">
                        {message.subject}
                      </p>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender?._id === selectedCustomer._id ? 'text-gray-500' : 'text-primary-200'
                      }`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {getConversation(selectedCustomer._id).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start a conversation!
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input mb-2"
                  />
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input flex-1"
                    rows="2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-primary px-6"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a customer to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerMessages;