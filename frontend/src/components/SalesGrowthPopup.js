import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SalesGrowthPopup = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Show recommendations after a short delay
      setTimeout(() => setShowRecommendations(true), 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    {
      title: 'New Users',
      value: '245',
      change: '+12%',
      comparison: 'vs yesterday',
      recommendation: 'Great growth! Consider running a referral program to maintain this momentum.'
    },
    {
      title: 'Orders',
      value: '1,234',
      change: '+8%',
      comparison: 'vs yesterday',
      recommendation: 'Orders are steady. Try bundling popular items to increase average order value.'
    },
    {
      title: 'Revenue',
      value: '$12,500',
      change: '+10%',
      comparison: 'vs yesterday',
      recommendation: 'Revenue is growing well. Consider adding premium products to boost margins.'
    },
    {
      title: 'Processing Time',
      value: '2.5 mins',
      change: '-15%',
      comparison: 'vs yesterday',
      recommendation: 'Processing time has improved! Keep optimizing your workflow.'
    }
  ];

  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl relative"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </motion.button>
            
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"
            >
              <Sparkles className="text-yellow-500" />
              Sales Growth Insights
            </motion.h2>

            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-gray-600">Analyzing your sales data...</p>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6">
                  {metrics.map((metric, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                      <motion.p 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="text-2xl font-bold text-gray-900 mt-1"
                      >
                        {metric.value}
                      </motion.p>
                      <div className="flex items-center mt-2">
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {metric.change}
                        </motion.span>
                        <span className="text-sm text-gray-500 ml-1">{metric.comparison}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {showRecommendations && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 p-4 bg-blue-50 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="text-blue-600" />
                        Smart Recommendations
                      </h3>
                      <div className="space-y-3">
                        {metrics.map((metric, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            {metric.change.startsWith('+') ? (
                              <TrendingUp className="text-green-500 mt-1" />
                            ) : (
                              <TrendingDown className="text-red-500 mt-1" />
                            )}
                            <p className="text-sm text-gray-700">{metric.recommendation}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SalesGrowthPopup; 