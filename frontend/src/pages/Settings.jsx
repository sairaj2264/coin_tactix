import React from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react'

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <a href="#" className="nav-item active">
              <User className="h-4 w-4 mr-3" />
              Profile
            </a>
            <a href="#" className="nav-item">
              <Bell className="h-4 w-4 mr-3" />
              Notifications
            </a>
            <a href="#" className="nav-item">
              <Shield className="h-4 w-4 mr-3" />
              Security
            </a>
            <a href="#" className="nav-item">
              <Database className="h-4 w-4 mr-3" />
              API Keys
            </a>
          </nav>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input type="text" className="input" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input type="email" className="input" placeholder="john@example.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select className="input">
                  <option>UTC</option>
                  <option>EST</option>
                  <option>PST</option>
                </select>
              </div>

              <div className="pt-4">
                <button className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
