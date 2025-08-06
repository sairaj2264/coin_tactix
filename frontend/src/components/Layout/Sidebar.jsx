import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar = ({ navigation, onNavigate }) => {
  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
              ${item.current
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            <Icon
              className={`
                mr-3 h-5 w-5 flex-shrink-0
                ${item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
              `}
            />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="ml-3 inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-800">
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default Sidebar
