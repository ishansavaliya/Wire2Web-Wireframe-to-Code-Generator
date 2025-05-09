import React from "react";
import { Home, User, Settings, Bell, Mail, Search, LogOut } from "lucide-react";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Dashboard title and right-aligned icons */}
      <div className="bg-white p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Mail className="w-5 h-5 text-gray-500" />
          <Bell className="w-5 h-5 text-gray-500" />
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      <div className="flex">
        {/* Left sidebar */}
        <div className="w-48 bg-white p-4 min-h-[calc(100vh-64px)]">
          <ul className="space-y-2">
            <li className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </li>
            <li className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </li>
            <li className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </li>
            <li className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </li>
          </ul>
        </div>

        {/* Main content area */}
        <div className="flex-1 p-6">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 border border-gray-300 rounded"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-1">Card Title 1</h3>
              <p className="text-sm text-gray-600">Description for card 1.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-1">Card Title 2</h3>
              <p className="text-sm text-gray-600">Description for card 2.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-1">Card Title 3</h3>
              <p className="text-sm text-gray-600">Description for card 3.</p>
            </div>
          </div>

          {/* Data table */}
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-medium">Data Table</h2>
            </div>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Age</th>
                  <th className="text-left p-4 font-medium">City</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">John Doe</td>
                  <td className="p-4">30</td>
                  <td className="p-4">New York</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Jane Smith</td>
                  <td className="p-4">28</td>
                  <td className="p-4">London</td>
                </tr>
                <tr>
                  <td className="p-4">Bob Johnson</td>
                  <td className="p-4">35</td>
                  <td className="p-4">Paris</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
