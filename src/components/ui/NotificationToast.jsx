/**
 * NotificationToast - Command Queue Side-Toast Layer
 * Displays [PENDING], [SUCCESS], [ERROR] notifications
 */

import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';

/**
 * @typedef {'pending' | 'success' | 'error'} NotificationStatus
 */

/**
 * @typedef {object} Notification
 * @property {string} id - Unique notification ID
 * @property {string} message - Notification message
 * @property {NotificationStatus} status - Current status
 * @property {number} timestamp - Creation timestamp
 */

/**
 * Single notification toast item
 */
function ToastItem({ notification, onDismiss }) {
  const statusConfig = {
    pending: {
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      label: 'PENDING',
      borderColor: 'border-yellow-500/30',
      bgColor: 'bg-yellow-950/20',
      textColor: 'text-yellow-400',
      labelBg: 'bg-yellow-500/20'
    },
    success: {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'SUCCESS',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-950/20',
      textColor: 'text-emerald-400',
      labelBg: 'bg-emerald-500/20'
    },
    error: {
      icon: <XCircle className="w-4 h-4" />,
      label: 'ERROR',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-950/20',
      textColor: 'text-red-400',
      labelBg: 'bg-red-500/20'
    }
  };

  const config = statusConfig[notification.status];

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 border backdrop-blur-xl rounded-xl',
        'animate-in slide-in-from-right-full duration-300',
        config.borderColor,
        config.bgColor
      )}
    >
      <span className={config.textColor}>
        {config.icon}
      </span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={clsx(
            'text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded',
            config.labelBg,
            config.textColor
          )}>
            [{config.label}]
          </span>
        </div>
        <p className="text-[11px] text-white font-mono leading-relaxed truncate">
          {notification.message}
        </p>
        <span className="text-[8px] text-zinc-500 font-mono mt-1 block">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-zinc-500 hover:text-white transition-colors p-1"
      >
        <X size={12} />
      </button>
    </div>
  );
}

/**
 * NotificationToast Container - Renders all active notifications
 */
export default function NotificationToast({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-[400] w-80 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <ToastItem
            notification={notification}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * CSS for animations - add to globals.css if not using Tailwind animate plugin
 */
const animationStyles = `
@keyframes slide-in-from-right-full {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-in {
  animation-fill-mode: both;
}

.slide-in-from-right-full {
  animation-name: slide-in-from-right-full;
}
`;
