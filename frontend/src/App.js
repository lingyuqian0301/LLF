import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
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
} from "lucide-react";
import "./App.css";

// --- Import your custom components ---
// Example: 
import NotificationManager from "./components/NotificationManager";
import TodayInsights from "./components/TodayInsights";
import GrabAssistantFab from "./components/GrabAssistantFab";
// The below import is your new chat page
import GrabAssistant from "./pages/GrabAssistant";

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
        popularHours: hours || [],
        popularDays: days || [],
        averageBasketSize: basketSize,
        averageOrderValue: orderValue,
        averageDeliveryTime: deliveryTime,
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
    if (tab === "message") {
      navigate("/grab-assistant");
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
            activeTab === "salesReport" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("salesReport")}
        >
          <BarChart2 size={18} />
          <span>Sales Report</span>
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

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "favourite" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("favourite")}
        >
          <Star size={18} />
          <span>Favourite</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "history" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("history")}
        >
          <History size={18} />
          <span>History</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${
            activeTab === "signout" ? "bg-gray-800" : "hover:bg-gray-900"
          }`}
          onClick={() => handleTabClick("signout")}
        >
          <LogOut size={18} />
          <span>Signout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-1/2">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search here..."
              className="pl-10 bg-gray-900 border-gray-800 text-gray-300 w-full rounded-md p-2"
            />
          </div>
          <div className="flex items-center gap-4">
            <Bell size={20} />
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              U
            </div>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<DashboardContent merchantData={merchantData} />} />
          <Route path="/grab-assistant" element={<GrabAssistant merchantData={merchantData} />} />
        </Routes>
      </div>
    </div>
  );
}

// -----------------------------------------------
// DashboardContent Component
// -----------------------------------------------
function DashboardContent({ merchantData }) {
  const navigate = useNavigate();

  // Set up data for your existing “Popular Hours” chart
  const popularHoursData = {
    labels: Array.isArray(merchantData.popularHours)
      ? merchantData.popularHours.map((h) => h.hour)
      : [],
    datasets: [
      {
        label: "Orders per Hour",
        data: Array.isArray(merchantData.popularHours)
          ? merchantData.popularHours.map((h) => h.count)
          : [],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Set up data for your existing “Popular Days” chart
  const popularDaysData = {
    labels: Array.isArray(merchantData.popularDays)
      ? merchantData.popularDays.map((d) => d.day)
      : [],
    datasets: [
      {
        label: "Orders per Day",
        data: Array.isArray(merchantData.popularDays)
          ? merchantData.popularDays.map((d) => d.count)
          : [],
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
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
      {/* Analytics Cards */}
      <div className="col-span-3 grid grid-cols-3 gap-6 mb-6">
        <SalesCard
          icon={<ShoppingCart size={24} />}
          value={
            typeof merchantData.averageBasketSize === "number"
              ? merchantData.averageBasketSize.toFixed(2)
              : "0"
          }
          label="Average Basket Size"
          change="+5%"
          changeColor="text-green-500"
        />
        <SalesCard
          icon={<Package size={24} />}
          value={
            typeof merchantData.averageOrderValue === "number"
              ? `$${merchantData.averageOrderValue.toFixed(2)}`
              : "$0"
          }
          label="Average Order Value"
          change="+12%"
          changeColor="text-green-500"
        />
        <SalesCard
          icon={<History size={24} />}
          value={
            typeof merchantData.averageDeliveryTime === "number"
              ? merchantData.averageDeliveryTime.toFixed(0) + " min"
              : "0 min"
          }
          label="Average Delivery Time"
          change="-2%"
          changeColor="text-red-500"
        />
      </div>

      {/* Charts Section */}
      <div className="col-span-2 space-y-6">
        {/* Popular Hours Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Popular Order Hours</h3>
          <div className="h-64">
            <Bar data={popularHoursData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Popular Days Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Popular Order Days</h3>
          <div className="h-64">
            <Bar data={popularDaysData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Today's Sales (example) */}
        <div className="bg-gray-900 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-1">Today's Sales</h2>
          <p className="text-gray-400 text-sm mb-4">Sales Summary</p>

          <div className="grid grid-cols-4 gap-4">
            <SalesCard
              icon={<BarChart className="text-yellow-500" />}
              value="$5k"
              label="Total Sales"
              change="+10% from yesterday"
              changeColor="text-yellow-500"
            />
            <SalesCard
              icon={<ShoppingCart className="text-white" />}
              value="500"
              label="Total Order"
              change="+8% from yesterday"
              changeColor="text-yellow-500"
            />
            <SalesCard
              icon={<Package className="text-pink-400" />}
              value="9"
              label="Product Sold"
              change="+2% from yesterday"
              changeColor="text-yellow-500"
            />
            <SalesCard
              icon={<User className="text-blue-400" />}
              value="12"
              label="New Customer"
              change="+3% from yesterday"
              changeColor="text-blue-400"
            />
          </div>
        </div>

        {/* A static "Top Products" table example */}
        <div className="bg-gray-900 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-6">Top Products</h2>

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
              <ProductRow
                id="01"
                name="Home Decor Range"
                popularity={75}
                sales={46}
                color="bg-yellow-500"
              />
              <ProductRow
                id="02"
                name="Disney Princess Dress"
                popularity={55}
                sales={17}
                color="bg-teal-400"
              />
              <ProductRow
                id="03"
                name="Bathroom Essentials"
                popularity={45}
                sales={19}
                color="bg-blue-400"
              />
              <ProductRow
                id="04"
                name="Apple Smartwatch"
                popularity={30}
                sales={29}
                color="bg-purple-400"
              />
            </tbody>
          </table>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Earnings (example) */}
          <div className="bg-gray-900 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-1">Earnings</h2>
            <p className="text-gray-400 text-sm mb-4">Total Expense</p>

            <div className="text-3xl font-bold text-teal-400 mb-2">$6078.76</div>
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

        {/* Top Selling Items (Table) */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Top Selling Items (Table)</h3>
          <div className="space-y-4">
            {Array.isArray(merchantData.topSellingItems) ? (
              merchantData.topSellingItems.map((item, index) => (
                <ProductRow
                  key={item.item_id}
                  item_id={item.item_id}
                  item_name={item.item_name}
                  num_sales={item.num_sales}
                  color={`bg-green-${500 - index * 100}`}
                />
              ))
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
          </div>
        </div>

        {/* Least Selling Items (Table) */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Least Selling Items (Table)</h3>
          <div className="space-y-4">
            {Array.isArray(merchantData.leastSellingItems) ? (
              merchantData.leastSellingItems.map((item, index) => (
                <ProductRow
                  key={item.item_id}
                  item_id={item.item_id}
                  item_name={item.item_name}
                  num_sales={item.num_sales}
                  color={`bg-red-${500 - index * 100}`}
                />
              ))
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
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
              <div className="text-gray-300">$4,087</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>This Month</span>
              <div className="text-gray-300">$5,506</div>
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
    <tr className="border-b border-gray-800">
      <td className="py-4">{displayId}</td>
      <td className="py-4">{displayName}</td>
      <td className="py-4 w-1/3">
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full`}
            style={{ width: `${displayPopularity}%` }}
          ></div>
        </div>
      </td>
      <td className="py-4 text-right">
        <span className="px-2 py-1 rounded-md bg-gray-800 text-xs">
          {typeof displaySales === "number" ? displaySales.toLocaleString() : displaySales}
        </span>
      </td>
    </tr>
  );
}

export default App;
