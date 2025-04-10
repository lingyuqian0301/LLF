"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
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
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "dashboard" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <Home size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "profile" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={18} />
          <span>Profile</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "leaderboard" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          <Award size={18} />
          <span>Leaderboard</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "order" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("order")}
        >
          <ShoppingCart size={18} />
          <span>Order</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "product" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("product")}
        >
          <Package size={18} />
          <span>Product</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "salesReport" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("salesReport")}
        >
          <BarChart2 size={18} />
          <span>Sales Report</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "message" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("message")}
        >
          <MessageSquare size={18} />
          <span>Grab Assistant</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "settings" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "favourite" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("favourite")}
        >
          <Star size={18} />
          <span>Favourite</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "history" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={18} />
          <span>History</span>
        </button>

        <button
          className={`flex items-center gap-3 p-2 rounded-md ${activeTab === "signout" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          onClick={() => setActiveTab("signout")}
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              type="text"
              placeholder="Search here..."
              className="pl-10 bg-gray-900 border-gray-800 text-gray-300 w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <Bell size={20} />
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Today's Sales */}
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

            {/* Top Products */}
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
                  <ProductRow id="01" name="Home Decore Range" popularity={75} sales={46} color="bg-yellow-500" />
                  <ProductRow id="02" name="Disney Princess Dress" popularity={55} sales={17} color="bg-teal-400" />
                  <ProductRow id="03" name="Bathroom Essentials" popularity={45} sales={19} color="bg-blue-400" />
                  <ProductRow id="04" name="Apple Smartwatch" popularity={30} sales={29} color="bg-purple-400" />
                </tbody>
              </table>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="bg-gray-900 rounded-lg p-5">
                <h2 className="text-xl font-semibold mb-1">Earnings</h2>
                <p className="text-gray-400 text-sm mb-4">Total Expense</p>

                <div className="text-3xl font-bold text-teal-400 mb-2">$6078.76</div>
                <p className="text-gray-400 text-sm mb-6">Profit is 48% More than last Month</p>

                <div className="relative pt-10">
                  <div className="w-40 h-40 mx-auto relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">80%</span>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="10" />
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

              {/* Visitor Insights */}
              <div className="bg-gray-900 rounded-lg p-5">
                <h2 className="text-xl font-semibold mb-6">Visitor Insights</h2>

                <div className="h-64 relative">
                  {/* This would be a real chart in a production app */}
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
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Level */}
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

            {/* Customer Fulfilment */}
            <div className="bg-gray-900 rounded-lg p-5">
              <h2 className="text-xl font-semibold mb-6">Customer Fulfilment</h2>

              <div className="h-48 relative mb-4">
                {/* This would be a real chart in a production app */}
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
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#5eead4" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#d8b4fe" stopOpacity="0" />
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
      </div>
    </div>
  )
}

function SalesCard({ icon, value, label, change, changeColor }) {
  return (
    <div className="bg-gray-950 rounded-lg p-4">
      <div className="mb-3">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`text-xs mt-2 ${changeColor}`}>{change}</div>
    </div>
  )
}

function ProductRow({ id, name, popularity, sales, color }) {
  return (
    <tr className="border-b border-gray-800">
      <td className="py-4">{id}</td>
      <td className="py-4">{name}</td>
      <td className="py-4 w-1/3">
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${popularity}%` }}></div>
        </div>
      </td>
      <td className="py-4 text-right">
        <span className={`px-2 py-1 rounded-md bg-gray-800 text-xs`}>{sales}%</span>
      </td>
    </tr>
  )
}
