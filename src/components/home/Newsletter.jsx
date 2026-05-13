import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiSend, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      
      // Reset subscribed state after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }, 1000);
  };

  return (
    <section className=" bg-[#4f7c82] py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6"
          >
            {isSubscribed ? (
              <FiCheckCircle className="w-8 h-8 text-white" />
            ) : (
              <FiMail className="w-8 h-8 text-white" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Subscribe to Our Newsletter
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-white/90 text-lg mb-8"
          >
            Get the latest updates on new products, exclusive offers, and special discounts
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <div className="flex items-center text-white">
              <FiCheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">10% Off First Order</span>
            </div>
            <div className="flex items-center text-white">
              <FiCheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Exclusive Deals</span>
            </div>
            <div className="flex items-center text-white">
              <FiCheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Early Access</span>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <div className="flex-1 relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="input pl-10 w-full"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Subscribe
                  <FiSend className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>

          {/* Trust Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-white/70 text-xs mt-6"
          >
            We respect your privacy. Unsubscribe at any time.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;