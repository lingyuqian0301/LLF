import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Filter, Plus, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import KeywordRecommendations from '../components/KeywordRecommendations';

function ProductPage({ merchantId }) {
  const [products, setProducts] = useState([]);
  const [keywordRecommendations, setKeywordRecommendations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch products and keyword recommendations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch keyword recommendations
        const response = await fetch(`http://localhost:8000/api/merchant/${merchantId}/enhanced-keyword-recommendations/`);
        const data = await response.json();
        setKeywordRecommendations(data.recommendations);
        
        // In a real app, you would also fetch products here
        // For now, we'll use dummy data
        setProducts([
          { id: 1, name: 'Double Patty Burger', price: 12.99, stock: 45, sales: 1101 },
          { id: 2, name: 'Classic Cheeseburger', price: 9.99, stock: 32, sales: 927 },
          { id: 3, name: 'Fries', price: 4.99, stock: 78, sales: 833 },
          { id: 4, name: 'Bacon Mushroom Burger', price: 13.99, stock: 27, sales: 798 }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (merchantId) {
      fetchData();
    }
  }, [merchantId]);

  const handleKeywordClick = (product, keyword) => {
    console.log('Keyword clicked:', product, keyword);
    // Navigate to the GrabAssistant page with the keyword information
    navigate('/grab-assistant', {
      state: {
        fromKeyword: true,
        product: product,
        keyword: keyword,
        message: `Show me insights about the keyword "${keyword.keyword}" for my product "${product}"`
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-400">Manage your product catalog and optimize keywords</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900 rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-4">Product Catalog</h2>
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
                    <span>Price</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Stock</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left pb-4">
                  <div className="flex items-center gap-1">
                    <span>Sales</span>
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
                  <td className="py-4">${product.price}</td>
                  <td className="py-4">{product.stock}</td>
                  <td className="py-4">{product.sales.toLocaleString()}</td>
                  <td className="py-4 pr-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <Edit size={16} className="text-blue-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyword Recommendations */}
      <KeywordRecommendations 
        recommendations={keywordRecommendations} 
        onKeywordClick={handleKeywordClick}
      />
    </div>
  );
}

export default ProductPage;
