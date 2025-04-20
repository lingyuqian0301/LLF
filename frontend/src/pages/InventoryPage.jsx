import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, TrendingUp, Plus, X } from 'lucide-react';

const InventoryPage = ({ merchantId }) => {
  // Dummy data instead of API calls
  const dummyInventoryData = {
    items: [
      { id: 1, name: 'Double Patty Burger', category: 'Burgers', quantity: 45, price: 12.99, lowStockThreshold: 20 },
      { id: 2, name: 'Classic Cheeseburger', category: 'Burgers', quantity: 32, price: 9.99, lowStockThreshold: 15 },
      { id: 3, name: 'Fries', category: 'Sides', quantity: 78, price: 4.99, lowStockThreshold: 30 },
      { id: 4, name: 'Bacon Mushroom Burger', category: 'Burgers', quantity: 27, price: 13.99, lowStockThreshold: 15 },
      { id: 5, name: 'Ice Lemon Tea', category: 'Beverages', quantity: 20, price: 4.50, lowStockThreshold: 5 },
      { id: 6, name: 'Cendol', category: 'Desserts', quantity: 15, price: 6.99, lowStockThreshold: 10 },
      { id: 7, name: 'Roti Canai', category: 'Bread', quantity: 2, price: 3.50, lowStockThreshold: 8 },
      { id: 8, name: 'Teh Tarik', category: 'Beverages', quantity: 25, price: 4.99, lowStockThreshold: 5 },
    ],
    lowStockItems: [
      { id: 7, name: 'Roti Canai', quantity: 2, lowStockThreshold: 8 },
    ],
    outOfStockItems: [],
    totalItems: 8,
    totalValue: 1250.75,
  };

  // Dummy data for high sales products
  const dummyHighSalesData = {
    highSalesProducts: [
      { id: 1, name: 'Double Patty Burger', sales: 1101, stock: 45, lowStockThreshold: 20 },
      { id: 2, name: 'Classic Cheeseburger', sales: 927, stock: 32, lowStockThreshold: 15 },
      { id: 3, name: 'Fries', sales: 833, stock: 78, lowStockThreshold: 30 },
      { id: 4, name: 'Bacon Mushroom Burger', sales: 798, stock: 27, lowStockThreshold: 15 },
    ],
  };

  const [inventoryData, setInventoryData] = useState(dummyInventoryData);
  const [highSalesData, setHighSalesData] = useState(dummyHighSalesData);
  const [peakHours, setPeakHours] = useState([]);
  const [peakDays, setPeakDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Restock modal state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [restockSuccess, setRestockSuccess] = useState(false);

  // Simulate API call with dummy data for inventory
  useEffect(() => {
    // Commented out API call
    /*
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        // Fetch inventory data from the backend
        const response = await fetch(`http://127.0.0.1:8000/api/merchant/${merchantId}/inventory/`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setInventoryData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setError('Failed to load inventory data. Please try again later.');
        setLoading(false);
      }
    };

    fetchInventoryData();
    */

    // Use dummy data instead
    setInventoryData(dummyInventoryData);
    setHighSalesData(dummyHighSalesData);
    
    // Generate alerts based on dummy data
    generateAlerts();
  }, [merchantId]);

  // Fetch peak hours and days from API
  useEffect(() => {
    const fetchPeakData = async () => {
      try {
        setLoading(true);
        
        // Fetch peak hours data
        const hoursResponse = await fetch(
          `http://127.0.0.1:8000/api/merchant/${merchantId}/popular-order-hours/`,
          { credentials: 'include' }
        );
        
        if (!hoursResponse.ok) {
          throw new Error(`HTTP error! Status: ${hoursResponse.status}`);
        }
        
        const hoursData = await hoursResponse.json();
        
        // Fetch peak days data
        const daysResponse = await fetch(
          `http://127.0.0.1:8000/api/merchant/${merchantId}/popular-order-days/`,
          { credentials: 'include' }
        );
        
        if (!daysResponse.ok) {
          throw new Error(`HTTP error! Status: ${daysResponse.status}`);
        }
        
        const daysData = await daysResponse.json();
        
        // Process the data
        const processedHours = Object.entries(hoursData).map(([hour, orders]) => ({
          hour: `${hour}:00`,
          orders
        }));
        
        const processedDays = Object.entries(daysData).map(([day, orders]) => ({
          day,
          orders
        }));
        
        setPeakHours(processedHours);
        setPeakDays(processedDays);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching peak data:', error);
        // Use dummy data if API fails
        setPeakHours([
          { hour: '12:00', orders: 45 },
          { hour: '13:00', orders: 52 },
          { hour: '18:00', orders: 48 },
          { hour: '19:00', orders: 60 },
        ]);
        
        setPeakDays([
          { day: 'Monday', orders: 120 },
          { day: 'Wednesday', orders: 135 },
          { day: 'Friday', orders: 150 },
          { day: 'Saturday', orders: 180 },
        ]);
        
        setLoading(false);
      }
    };

    fetchPeakData();
  }, [merchantId]);

  // Function to generate alerts based on dummy data
  const generateAlerts = () => {
    const alerts = [];
    
    // Check for low stock items
    if (inventoryData.lowStockItems.length > 0) {
      alerts.push(`${inventoryData.lowStockItems.length} items are running low on stock.`);
    }
    
    // Check for out of stock items
    if (inventoryData.outOfStockItems.length > 0) {
      alerts.push(`${inventoryData.outOfStockItems.length} items are out of stock.`);
    }
    
    // Check for high sales products with low stock
    const highSalesLowStock = highSalesData.highSalesProducts.filter(
      product => product.stock < product.lowStockThreshold
    );
    
    if (highSalesLowStock.length > 0) {
      alerts.push(`${highSalesLowStock.length} high-selling products need restocking.`);
    }
    
    // Check for peak hours
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[currentDay];
    
    const isPeakHour = peakHours.some(
      peak => parseInt(peak.hour.split(':')[0]) === currentHour
    );
    
    const isPeakDay = peakDays.some(
      peak => peak.day === currentDayName
    );
    
    if (isPeakHour) {
      alerts.push(`Current hour (${currentHour}:00) is a peak ordering time.`);
    }
    
    if (isPeakDay) {
      alerts.push(`Today (${currentDayName}) is a peak ordering day.`);
    }
    
    // Set alert message if there are any alerts
    if (alerts.length > 0) {
      setAlertMessage(alerts.join(' '));
      setShowAlert(true);
    }
  };

  // Handle opening the restock modal
  const handleRestockClick = (item, isHighSales = false) => {
    setSelectedItem({
      ...item,
      isHighSales
    });
    setRestockQuantity(1);
    setShowRestockModal(true);
  };

  // Handle restocking an item
  const handleRestockSubmit = () => {
    if (!selectedItem) return;
    
    // Update inventory data
    const updatedItems = inventoryData.items.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          quantity: item.quantity + restockQuantity
        };
      }
      return item;
    });
    
    // Update high sales data
    const updatedHighSalesProducts = highSalesData.highSalesProducts.map(product => {
      if (product.id === selectedItem.id) {
        return {
          ...product,
          stock: product.stock + restockQuantity
        };
      }
      return product;
    });
    
    // Update low stock items
    const updatedLowStockItems = inventoryData.lowStockItems.filter(item => {
      if (item.id === selectedItem.id) {
        // Check if the item is still low in stock after restocking
        const updatedItem = updatedItems.find(i => i.id === item.id);
        return updatedItem.quantity < updatedItem.lowStockThreshold;
      }
      return true;
    });
    
    // Update out of stock items
    const updatedOutOfStockItems = inventoryData.outOfStockItems.filter(item => {
      if (item.id === selectedItem.id) {
        // Check if the item is still out of stock after restocking
        const updatedItem = updatedItems.find(i => i.id === item.id);
        return updatedItem.quantity === 0;
      }
      return true;
    });
    
    // Update state
    setInventoryData({
      ...inventoryData,
      items: updatedItems,
      lowStockItems: updatedLowStockItems,
      outOfStockItems: updatedOutOfStockItems
    });
    
    setHighSalesData({
      ...highSalesData,
      highSalesProducts: updatedHighSalesProducts
    });
    
    // Show success message
    setRestockSuccess(true);
    
    // Close modal after a delay
    setTimeout(() => {
      setShowRestockModal(false);
      setRestockSuccess(false);
      setSelectedItem(null);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertTriangle size={48} />
        <p className="mt-4 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Alert Banner */}
      {showAlert && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle size={20} />
            <span className="font-medium">Inventory Alert:</span>
            <span>{alertMessage}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Package size={18} />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Total Items</div>
          <div className="text-2xl font-bold mt-1">{inventoryData.totalItems}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Total Value</div>
          <div className="text-2xl font-bold mt-1">RM{inventoryData.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Low Stock Items</div>
          <div className="text-2xl font-bold mt-1 text-yellow-500">{inventoryData.lowStockItems.length}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Out of Stock</div>
          <div className="text-2xl font-bold mt-1 text-red-500">{inventoryData.outOfStockItems.length}</div>
        </div>
      </div>

      {/* Peak Hours and Days */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-400" size={20} />
            <h3 className="text-lg font-semibold">Peak Ordering Hours</h3>
          </div>
          <div className="space-y-2">
            {peakHours.map((peak, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{peak.hour}</span>
                <span className="text-blue-400">{peak.orders} orders</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-purple-400" size={20} />
            <h3 className="text-lg font-semibold">Peak Ordering Days</h3>
          </div>
          <div className="space-y-2">
            {peakDays.map((peak, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{peak.day}</span>
                <span className="text-purple-400">{peak.orders} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Sales Products */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-green-400" size={20} />
          <h3 className="text-lg font-semibold">High Sales Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-4 text-gray-400">Product Name</th>
                <th className="p-4 text-gray-400">Sales</th>
                <th className="p-4 text-gray-400">Current Stock</th>
                <th className="p-4 text-gray-400">Status</th>
                <th className="p-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {highSalesData.highSalesProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">{product.sales}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">
                    {product.stock === 0 ? (
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle size={16} />
                        <span>Out of Stock</span>
                      </span>
                    ) : product.stock < product.lowStockThreshold ? (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <AlertTriangle size={16} />
                        <span>Low Stock</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle size={16} />
                        <span>In Stock</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                      onClick={() => handleRestockClick(product, true)}
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Inventory Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-4 text-gray-400">Item Name</th>
                <th className="p-4 text-gray-400">Category</th>
                <th className="p-4 text-gray-400">Quantity</th>
                <th className="p-4 text-gray-400">Price</th>
                <th className="p-4 text-gray-400">Status</th>
                <th className="p-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">RM{item.price.toFixed(2)}</td>
                  <td className="p-4">
                    {item.quantity === 0 ? (
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle size={16} />
                        <span>Out of Stock</span>
                      </span>
                    ) : item.quantity < item.lowStockThreshold ? (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <AlertTriangle size={16} />
                        <span>Low Stock</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle size={16} />
                        <span>In Stock</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                        onClick={() => handleRestockClick(item)}
                      >
                        Restock
                      </button>
                      <button className="text-blue-400 hover:text-blue-300">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {inventoryData.lowStockItems.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-500 mb-2">Low Stock Alerts</h3>
          <div className="space-y-2">
            {inventoryData.lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-400 ml-2">({item.quantity} remaining)</span>
                </div>
                <button 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm"
                  onClick={() => handleRestockClick(item)}
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Restock {selectedItem.name}</h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowRestockModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            {restockSuccess ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="text-green-500 mb-4" size={48} />
                <p className="text-lg font-medium">Stock updated successfully!</p>
                <p className="text-gray-400 mt-2">
                  {selectedItem.isHighSales 
                    ? `Added ${restockQuantity} units to ${selectedItem.name}`
                    : `Added ${restockQuantity} units to ${selectedItem.name}`
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-400 mb-2">Current Stock: {selectedItem.isHighSales ? selectedItem.stock : selectedItem.quantity}</p>
                  <p className="text-gray-400 mb-2">Low Stock Threshold: {selectedItem.lowStockThreshold}</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">Quantity to Add</label>
                  <div className="flex items-center">
                    <button 
                      className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded-l-md flex items-center justify-center"
                      onClick={() => setRestockQuantity(Math.max(1, restockQuantity - 1))}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="1"
                      value={restockQuantity}
                      onChange={(e) => setRestockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-gray-700 text-white w-20 h-10 text-center focus:outline-none"
                    />
                    <button 
                      className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded-r-md flex items-center justify-center"
                      onClick={() => setRestockQuantity(restockQuantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                    onClick={() => setShowRestockModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2"
                    onClick={handleRestockSubmit}
                  >
                    <Plus size={16} />
                    <span>Add Stock</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage; 