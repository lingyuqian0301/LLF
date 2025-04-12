import React, { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, Edit, Save, ArrowUpDown } from 'lucide-react';

function OperationPage({ merchantId }) {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tempCost, setTempCost] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Calculate summary metrics
  const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.sales), 0);
  const totalCost = products.reduce((sum, product) => sum + ((product.cost || 0) * product.sales), 0);
  const totalProfit = totalRevenue - totalCost;
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Fetch products and load saved costs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch products from the API
        // For now, we'll use dummy data with preset costs
        const dummyProducts = [
          { id: 1, name: 'Double Patty Burger', price: 12.99, stock: 45, sales: 1101, cost: 5.50 },
          { id: 2, name: 'Classic Cheeseburger', price: 9.99, stock: 32, sales: 927, cost: 4.20 },
          { id: 3, name: 'Fries', price: 4.99, stock: 78, sales: 833, cost: 1.80 },
          { id: 4, name: 'Bacon Mushroom Burger', price: 13.99, stock: 27, sales: 798, cost: 6.30 }
        ];

        // Load saved costs from localStorage (will override preset costs if available)
        const savedCosts = JSON.parse(localStorage.getItem('productCosts') || '{}');
        
        // Merge products with saved costs
        const productsWithCosts = dummyProducts.map(product => ({
          ...product,
          cost: savedCosts[product.id] !== undefined ? savedCosts[product.id] : product.cost
        }));
        
        setProducts(productsWithCosts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [merchantId]);

  // Save cost for a product
  const saveCost = (productId) => {
    if (!tempCost || isNaN(parseFloat(tempCost))) {
      setEditingId(null);
      setTempCost('');
      return;
    }

    // Update product cost in state
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return { ...product, cost: parseFloat(tempCost) };
      }
      return product;
    });
    setProducts(updatedProducts);

    // Save to localStorage
    const savedCosts = JSON.parse(localStorage.getItem('productCosts') || '{}');
    savedCosts[productId] = parseFloat(tempCost);
    localStorage.setItem('productCosts', JSON.stringify(savedCosts));

    // Reset editing state
    setEditingId(null);
    setTempCost('');
  };

  // Calculate profit for a product
  const calculateProfit = (price, cost) => {
    if (cost === null || isNaN(cost)) return null;
    return price - cost;
  };

  // Calculate margin for a product
  const calculateMargin = (price, cost) => {
    if (cost === null || isNaN(cost) || cost === 0) return null;
    return ((price - cost) / price) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Operations</h1>
          <p className="text-gray-400">Manage costs and track profitability</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-500" size={20} />
            <h3 className="font-semibold">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold">RM{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-red-500" size={20} />
            <h3 className="font-semibold">Total Cost</h3>
          </div>
          <p className="text-2xl font-bold">RM{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-blue-500" size={20} />
            <h3 className="font-semibold">Total Profit</h3>
          </div>
          <p className="text-2xl font-bold">RM{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-purple-500" size={20} />
            <h3 className="font-semibold">Average Margin</h3>
          </div>
          <p className="text-2xl font-bold">{averageMargin.toFixed(2)}%</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900 rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-4">Product Profitability</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left pb-4 pl-4">
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Cost</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Profit</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Margin</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Sales</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Total Profit</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-right pb-4 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-4 pl-4">{product.id}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-blue-500" />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4">RM{product.price.toFixed(2)}</td>
                  <td className="py-4">
                    {editingId === product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={tempCost}
                          onChange={(e) => setTempCost(e.target.value)}
                          className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveCost(product.id)}
                          className="p-1 bg-green-600 rounded hover:bg-green-700"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{product.cost !== null ? `RM${product.cost.toFixed(2)}` : 'Not set'}</span>
                        <button 
                          onClick={() => {
                            setEditingId(product.id);
                            setTempCost(product.cost !== null ? product.cost.toString() : '');
                          }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <Edit size={14} className="text-blue-500" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    {calculateProfit(product.price, product.cost) !== null 
                      ? `RM${calculateProfit(product.price, product.cost).toFixed(2)}` 
                      : '-'}
                  </td>
                  <td className="py-4">
                    {calculateMargin(product.price, product.cost) !== null 
                      ? `${calculateMargin(product.price, product.cost).toFixed(2)}%` 
                      : '-'}
                  </td>
                  <td className="py-4">{product.sales.toLocaleString()}</td>
                  <td className="py-4">
                    {calculateProfit(product.price, product.cost) !== null 
                      ? `RM${(calculateProfit(product.price, product.cost) * product.sales).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                      : '-'}
                  </td>
                  <td className="py-4 pr-4">
                    {/* Additional actions could go here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OperationPage;