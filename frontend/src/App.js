import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import {
  BarChart,
  Home,
  User,
  Award,
  ShoppingCart,
  Package,
  BarChart2,
  MessageSquare,
  Settings,
  Star,
  History,
  LogOut,
  Search,
  Bell,
  Clock,
  Calendar,
  DollarSign
} from "lucide-react";
import "./App.css";

// --- Import your custom components ---
// Example:
import NotificationManager from "./components/NotificationManager";
import TodayInsights from "./components/TodayInsights";
import GrabAssistantFab from "./components/GrabAssistantFab";
// The below import is your new chat page
import GrabAssistant from "./pages/GrabAssistant";
import SalesGrowthPopup from "./components/SalesGrowthPopup";
import ProductPage from "./pages/ProductPage";
import OperationPage from "./pages/OperationPage";
import SalesReportPage from "./pages/SalesReport";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// An example fetch function using the native Fetch API
const fetchMerchantData = async (merchantId, endpoint) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/merchant/${merchantId}/${endpoint}/`,
      { credentials: "include" }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [merchantData, setMerchantData] = useState({
    topSellingItems: [],
    leastSellingItems: [],
    popularHours: [],
    popularDays: [],
    averageBasketSize: null,
    averageOrderValue: null,
    averageDeliveryTime: null,
  });

  const navigate = useNavigate();
  const merchantId = "2e8a5"; // Example merchant ID

  // Fetch all merchant data at once
  useEffect(() => {
    const fetchAllMerchantData = async () => {
      const [
        topSelling,
        leastSelling,
        hours,
        days,
        basketSize,
        orderValue,
        deliveryTime,
      ] = await Promise.all([
        fetchMerchantData(merchantId, "top-selling-items"),
        fetchMerchantData(merchantId, "least-selling-items"),
        fetchMerchantData(merchantId, "popular-order-hours"),
        fetchMerchantData(merchantId, "popular-order-days"),
        fetchMerchantData(merchantId, "average-basket-size"),
        fetchMerchantData(merchantId, "average-order-value"),
        fetchMerchantData(merchantId, "average-delivery-time"),
      ]);

      setMerchantData({
        topSellingItems: topSelling || [],
        leastSellingItems: leastSelling || [],
        popularHours: hours || {},
        popularDays: days || {},
        average_basket_size: basketSize?.average_basket_size || 0,
        average_order_value: orderValue?.average_order_value || 0,
        average_delivery_time: deliveryTime?.average_delivery_time || 0,
      });
    };

    fetchAllMerchantData();
  }, [merchantId]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/merchant/${merchantId}/notifications/`,
          { credentials: "include" }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setNotifications(data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [merchantId]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "dashboard") {
      navigate("/");
    } else if (tab === "products") {
      navigate("/products");
    } else if (tab === "operations") {
      navigate("/operations");
    } else if (tab === "sales-report") {
      navigate("/sales-report");
    } else if (tab === "message") {
      navigate("/grab-assistant");
    } else if (tab === "product") {
      navigate("/product");
    } else if (tab === "operation") {
      navigate("/operation");
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <TodayInsights />
      <NotificationManager />
      <GrabAssistantFab />

      {/* Sidebar */}
      <div className="w-48 border-r border-gray-800 p-4 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "dashboard" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => {
            handleTabClick("dashboard");
            navigate("/");
          }}
        >
          <Home size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "sales-report" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("sales-report")}
        >
          <BarChart2 size={18} />
          <span>Sales Report</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "profile" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("profile")}
        >
          <User size={18} />
          <span>Profile</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "leaderboard" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("leaderboard")}
        >
          <Award size={18} />
          <span>Leaderboard</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "order" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("order")}
        >
          <ShoppingCart size={18} />
          <span>Order</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "product" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("product")}
        >
          <Package size={18} />
          <span>Product</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "operation" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("operation")}
        >
          <DollarSign size={18} />
          <span>Operation</span>
        </button>

        
        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "message" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("message")}
        >
          <MessageSquare size={18} />
          <span>Grab Assistant</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "settings" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("settings")}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        {/* ... rest of the sidebar code ... */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "profile" && "Profile"}
              {activeTab === "leaderboard" && "Leaderboard"}
              {activeTab === "order" && "Order Management"}
              {activeTab === "product" && "Product Management"}
              {activeTab === "operation" && "Operation Management"}
              {activeTab === "salesReport" && "Sales Report"}
              {activeTab === "message" && "Grab Assistant"}
              {activeTab === "settings" && "Settings"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-gray-800">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-semibold">JD</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardContent
                  merchantData={merchantData}
                  merchantId={merchantId}
                />
              }
            />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/operations" element={<OperationPage />} />
            <Route path="/sales-report" element={<SalesReportPage />} />
            <Route
              path="/grab-assistant"
              element={
                <GrabAssistant
                  merchantData={merchantData}
                  merchantId={merchantId}
                />
              }
            />
            <Route
              path="/product"
              element={<ProductPage merchantId={merchantId} />}
            />
            <Route
              path="/operation"
              element={<OperationPage merchantId={merchantId} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------
// DashboardContent Component
// -----------------------------------------------
function DashboardContent({ merchantData, merchantId }) {
  const navigate = useNavigate();

  // Set up data for your existing “Popular Hours” chart
  const popularHoursData = {
    labels: merchantData.popularHours
      ? Object.keys(merchantData.popularHours).map(hour => `${hour}:00`)
      : [],
    datasets: [
      {
        label: "Orders per Hour",
        data: merchantData.popularHours
          ? Object.values(merchantData.popularHours)
          : [],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
    ],
  };

  // Set up data for your existing “Popular Days” chart
  const popularDaysData = {
    labels: merchantData.popularDays
      ? Object.keys(merchantData.popularDays)
      : [],
    datasets: [
      {
        label: "Orders per Day",
        data: merchantData.popularDays
          ? Object.values(merchantData.popularDays)
          : [],
        backgroundColor: "rgba(168, 85, 247, 0.5)",
        borderColor: "rgb(168, 85, 247)",
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
    ],
  };

  // -----------------------------------------------
  // CHARTS FOR TOP & LEAST SELLING ITEMS (CLICKABLE)
  // -----------------------------------------------
  const topSellingItemsChartData = {
    labels: merchantData.topSellingItems.map((item) => item.item_name),
    datasets: [
      {
        label: "Top Selling Items",
        data: merchantData.topSellingItems.map((item) => item.num_sales),
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const leastSellingItemsChartData = {
    labels: merchantData.leastSellingItems.map((item) => item.item_name),
    datasets: [
      {
        label: "Least Selling Items",
        data: merchantData.leastSellingItems.map((item) => item.num_sales),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  // When user clicks on a bar in the “Top Selling Items” chart
  const handleTopSellingBarClick = (evt, elements) => {
    if (!elements.length) return;
    const { index } = elements[0];
    const clickedItem = merchantData.topSellingItems[index];

    // Navigate to chat with item data
    navigate("/grab-assistant", {
      state: {
        fromChart: true,
        chartType: "top-selling",
        item: clickedItem,
      },
    });
  };

  // When user clicks on a bar in the “Least Selling Items” chart
  const handleLeastSellingBarClick = (evt, elements) => {
    if (!elements.length) return;
    const { index } = elements[0];
    const clickedItem = merchantData.leastSellingItems[index];

    // Navigate to chat with item data
    navigate("/grab-assistant", {
      state: {
        fromChart: true,
        chartType: "least-selling",
        item: clickedItem,
      },
    });
  };

  return (
    <div className="grid grid-cols-3 gap-6">
       <SalesGrowthPopup />
      {/* Analytics Cards */}
      {/* Analytics Overview Section */}
      <div className="bg-gray-900 rounded-lg p-5 col-span-3 mb-6">
        <h2 className="text-xl font-semibold mb-1">Analytics Overview</h2>
        <p className="text-gray-400 text-sm mb-4">Performance Summary</p>

        <div className="grid grid-cols-4 gap-4">
          <SalesCard
            icon={<ShoppingCart className="text-green-500" size={24} />}
            value={merchantData.average_basket_size?.toFixed(2) || "0"}
            label="Average Basket Size"
            change="+5% from yesterday"
            changeColor="text-green-500"
          />
          <SalesCard
            icon={<Package className="text-green-500" size={24} />}
            value={`RM${merchantData.average_order_value?.toFixed(2) || "124.32"}`}
            label="Average Order Value"
            change="+12% from yesterday"
            changeColor="text-green-500"
          />
          <SalesCard
            icon={<History className="text-green-500" size={24} />}
            value={`${merchantData.average_delivery_time?.toFixed(0) || "39"} min`}
            label="Average Delivery Time"
            change="-2% from yesterday"
            changeColor="text-red-500"
          />
          <SalesCard
            icon={<BarChart2 className="text-green-500" size={24} />}
            value={merchantData.topSellingItems?.length || "4"}
            label="Active Products"
            change="+8% from yesterday"
            changeColor="text-green-500"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="col-span-2 space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Analytics Overview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/grab-assistant', { state: { showAnalytics: true } })}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <BarChart2 size={16} />
              <span>View Full Analytics</span>
            </button>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Popular Hours Chart */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold">Popular Order Hours</h3>
            </div>
            <div className="h-64">
              <Line
                data={popularHoursData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(75, 85, 99, 0.2)'
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(75, 85, 99, 0.2)'
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#9CA3AF'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Popular Days Chart */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-purple-400" size={20} />
              <h3 className="text-lg font-semibold">Popular Order Days</h3>
            </div>
            <div className="h-64">
              <Line data={popularDaysData} options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(75, 85, 99, 0.2)'
                    },
                    ticks: {
                      color: '#9CA3AF'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(75, 85, 99, 0.2)'
                    },
                    ticks: {
                      color: '#9CA3AF'
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      color: '#9CA3AF'
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>




                {/* Top Products Table */}
                <div className="bg-gray-900 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Top Products</h2>
              <p className="text-gray-400 text-sm">Best performing items</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-1/3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-green-500 text-sm font-medium mb-1">Total Revenue</div>
                <div className="text-lg font-semibold">
                  RM{(merchantData.topSellingItems?.[0]?.num_sales * 10 || 0).toLocaleString()}
                </div>
                <div className="text-green-500 text-xs">+10% from yesterday</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-green-500 text-sm font-medium mb-1">Total Sales</div>
                <div className="text-lg font-semibold">
                  {merchantData.topSellingItems?.[0]?.num_sales?.toLocaleString() || "0"}
                </div>
                <div className="text-green-500 text-xs">+8% from yesterday</div>
              </div>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left pb-4">#</th>
                <th className="text-left pb-4">Name</th>
                <th className="text-left pb-4">Popularity</th>
                <th className="text-right pb-4">Sales</th>
              </tr>
            </thead>
            <tbody>
              {merchantData.topSellingItems?.slice(0, 4).map((item, index) => (
                <ProductRow
                  key={item.item_id}
                  id={String(index + 1).padStart(2, '0')}
                  name={item.item_name}
                  popularity={Math.round((item.num_sales / (merchantData.topSellingItems[0]?.num_sales || 1)) * 100)}
                  sales={item.num_sales}
                  color={[
                    'bg-green-500',
                    'bg-green-400',
                    'bg-green-300',
                    'bg-green-200'
                  ][index]}
                />
              ))}
            </tbody>
          </table>
        </div>
         {/* Least Products Table */}
         <div className="bg-gray-900 rounded-lg p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Least Products</h2>
              <p className="text-gray-400 text-sm">Items needing attention</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-1/3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-red-500 text-sm font-medium mb-1">Total Revenue</div>
                <div className="text-lg font-semibold">
                  RM{(merchantData.leastSellingItems?.[0]?.num_sales * 10 || 0).toLocaleString()}
                </div>
                <div className="text-red-500 text-xs">-5% from yesterday</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-red-500 text-sm font-medium mb-1">Total Sales</div>
                <div className="text-lg font-semibold">
                  {merchantData.leastSellingItems?.[0]?.num_sales?.toLocaleString() || "0"}
                </div>
                <div className="text-red-500 text-xs">-3% from yesterday</div>
              </div>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left pb-4">#</th>
                <th className="text-left pb-4">Name</th>
                <th className="text-left pb-4">Popularity</th>
                <th className="text-right pb-4">Sales</th>
              </tr>
            </thead>
            <tbody>
              {merchantData.leastSellingItems?.slice(0, 4).map((item, index) => (
                <ProductRow
                  key={item.item_id}
                  id={String(index + 1).padStart(2, '0')}
                  name={item.item_name}
                  popularity={Math.round((item.num_sales / (merchantData.topSellingItems[0]?.num_sales || 1)) * 100)}
                  sales={item.num_sales}
                  color={[
                    'bg-red-500',
                    'bg-red-400',
                    'bg-red-300',
                    'bg-red-200'
                  ][index]}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Earnings (example) */}
          <div className="bg-gray-900 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-1">Earnings</h2>
            <p className="text-gray-400 text-sm mb-4">Total Expense</p>

            <div className="text-3xl font-bold text-teal-400 mb-2">RM6078.76</div>
            <p className="text-gray-400 text-sm mb-6">
              Profit is 48% More than last Month
            </p>

            <div className="relative pt-10">
              <div className="w-40 h-40 mx-auto relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">80%</span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#5eead4"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset="56"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Visitor Insights (example) */}
          <div className="bg-gray-900 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-6">Visitor Insights</h2>

            <div className="h-64 relative">
              <div className="absolute inset-0">
                <svg viewBox="0 0 500 200" className="w-full h-full">
                  <path
                    d="M0,150 C50,120 100,180 150,120 C200,60 250,100 300,60 C350,20 400,80 450,40 C480,20 500,40 500,40"
                    fill="none"
                    stroke="#5eead4"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,150 C50,120 100,180 150,120 C200,60 250,100 300,60 C350,20 400,80 450,40 C480,20 500,40 500,40"
                    fill="url(#gradient)"
                    fillOpacity="0.2"
                    stroke="none"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#5eead4" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>

              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
                <span>500</span>
                <span>400</span>
                <span>300</span>
                <span>200</span>
                <span>100</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section (Right Column) */}
      <div className="space-y-6">
        {/* Top Selling Items (Chart) */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Top Selling Items (Chart)</h3>
          <div className="h-64">
            <Bar
              data={topSellingItemsChartData}
              options={{
                maintainAspectRatio: false,
                onClick: handleTopSellingBarClick,
              }}
            />
          </div>
        </div>

        {/* Least Selling Items (Chart) */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Least Selling Items (Chart)</h3>
          <div className="h-64">
            <Bar
              data={leastSellingItemsChartData}
              options={{
                maintainAspectRatio: false,
                onClick: handleLeastSellingBarClick,
              }}
            />
          </div>
        </div>





        {/* Example “Level” section */}
        <div className="bg-gray-900 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-6">Level</h2>
          <div className="h-48 flex items-end gap-3 mb-4">
            <div className="h-[60%] w-full bg-teal-200 rounded-t-md"></div>
            <div className="h-[80%] w-full bg-teal-200 rounded-t-md"></div>
            <div className="h-[50%] w-full bg-teal-200 rounded-t-md"></div>
            <div className="h-[30%] w-full bg-teal-200 rounded-t-md"></div>
            <div className="h-[40%] w-full bg-teal-200 rounded-t-md"></div>
            <div className="h-[70%] w-full bg-teal-200 rounded-t-md"></div>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-200"></div>
              <span>Volume</span>
            </div>
            <span>Service</span>
          </div>
        </div>

        {/* Example “Customer Fulfilment” section */}
        <div className="bg-gray-900 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-6">Customer Fulfilment</h2>
          <div className="h-48 relative mb-4">
            <div className="absolute inset-0">
              <svg viewBox="0 0 500 200" className="w-full h-full">
                <path
                  d="M0,100 C50,80 100,120 150,70 C200,20 250,60 300,30 C350,10 400,50 450,20 C480,10 500,30 500,30"
                  fill="none"
                  stroke="#5eead4"
                  strokeWidth="2"
                />
                <path
                  d="M0,100 C50,80 100,120 150,70 C200,20 250,60 300,30 C350,10 400,50 450,20 C480,10 500,30 500,30"
                  fill="url(#gradient1)"
                  fillOpacity="0.2"
                  stroke="none"
                />
                <path
                  d="M0,150 C50,130 100,160 150,120 C200,80 250,110 300,90 C350,70 400,100 450,80 C480,70 500,90 500,90"
                  fill="none"
                  stroke="#d8b4fe"
                  strokeWidth="2"
                />
                <path
                  d="M0,150 C50,130 100,160 150,120 C200,80 250,110 300,90 C350,70 400,100 450,80 C480,70 500,90 500,90"
                  fill="url(#gradient2)"
                  fillOpacity="0.2"
                  stroke="none"
                />
                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#5eead4"
                      stopOpacity="0.5"
                    />
                    <stop
                      offset="100%"
                      stopColor="#5eead4"
                      stopOpacity="0"
                    />
                  </linearGradient>
                  <linearGradient
                    id="gradient2"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#d8b4fe"
                      stopOpacity="0.5"
                    />
                    <stop
                      offset="100%"
                      stopColor="#d8b4fe"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Last Month</span>
              <div className="text-gray-300">RM4,087</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>This Month</span>
              <div className="text-gray-300">RM5,506</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------
// SalesCard
// -----------------------------------------------
function SalesCard({ icon, value, label, change, changeColor }) {
  return (
    <div className="bg-gray-950 rounded-lg p-4">
      <div className="mb-3">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`text-xs mt-2 ${changeColor}`}>{change}</div>
    </div>
  );
}

// -----------------------------------------------
// ProductRow for table
// -----------------------------------------------
function ProductRow({ id, name, popularity, sales, item_id, item_name, num_sales, color }) {
  // unify the data whether using props `id, name, sales, popularity` or the `item_`
  const displayId = item_id || id;
  const displayName = item_name || name;
  const displaySales = num_sales || sales;
  const displayPopularity = popularity || (num_sales ? (num_sales / 41529) * 100 : 0);

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
      <td className="py-4 pl-2">{displayId}</td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{displayName}</span>
        </div>
      </td>
      <td className="py-4 w-1/3">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${displayPopularity}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-400 w-12">{displayPopularity}%</span>
        </div>
      </td>
      <td className="py-4 text-right pr-2">
        <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-medium">
          {typeof displaySales === "number" ? displaySales.toLocaleString() : displaySales}
        </span>
      </td>
    </tr>
  );
}

export default App;
