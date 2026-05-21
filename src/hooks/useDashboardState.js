/**
 * Global Dashboard State Hook
 * Manages system health, notifications, and authentication state
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { measureLatency } from '../services/telemetry';

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

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
 * Custom hook for notification queue management
 * @returns {object} Notification state and handlers
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, status = 'pending') => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification = { id, message, status, timestamp: Date.now() };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-dismiss after 5 seconds for success/error
    if (status !== 'pending') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
    
    return id;
  }, []);

  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates } : n
    ));
    
    // Auto-dismiss after update if success/error
    if (updates.status && updates.status !== 'pending') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    updateNotification,
    removeNotification,
    clearAllNotifications
  };
}

// ============================================================================
// SYSTEM HEALTH MONITORING
// ============================================================================

/**
 * @typedef {object} SystemHealth
 * @property {number | null} latencyMs - Network latency in milliseconds
 * @property {'healthy' | 'degraded' | 'offline'} status - Connection status
 * @property {Date | null} lastSync - Last successful sync timestamp
 * @property {number} activeVisitors - Count of active visitors
 */

/**
 * Custom hook for system health monitoring
 * @param {boolean} isConnected - Whether database is connected
 * @returns {object} System health state and handlers
 */
export function useSystemHealth(isConnected) {
  const [health, setHealth] = useState({
    latencyMs: null,
    status: 'offline',
    lastSync: null,
    activeVisitors: 0
  });
  
  const intervalRef = useRef(null);

  const checkLatency = useCallback(async () => {
    if (!isConnected) {
      setHealth(prev => ({ ...prev, status: 'offline', latencyMs: null }));
      return;
    }

    const result = await measureLatency();
    
    if (result.success) {
      const latency = result.data.latencyMs;
      let status = 'healthy';
      
      if (latency > 300) {
        status = 'degraded';
      } else if (latency > 1000) {
        status = 'offline';
      }
      
      setHealth(prev => ({
        ...prev,
        latencyMs: latency,
        status
      }));
    } else {
      setHealth(prev => ({ ...prev, status: 'offline', latencyMs: null }));
    }
  }, [isConnected]);

  const updateLastSync = useCallback(() => {
    setHealth(prev => ({ ...prev, lastSync: new Date() }));
  }, []);

  const updateActiveVisitors = useCallback((count) => {
    setHealth(prev => ({ ...prev, activeVisitors: count }));
  }, []);

  // Periodic latency check (every 30 seconds when connected)
  useEffect(() => {
    if (isConnected) {
      checkLatency();
      intervalRef.current = setInterval(checkLatency, 30000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setHealth(prev => ({ ...prev, status: 'offline', latencyMs: null }));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected, checkLatency]);

  return {
    health,
    checkLatency,
    updateLastSync,
    updateActiveVisitors
  };
}

// ============================================================================
// PASSWORD AUTHENTICATION STATE
// ============================================================================

const AUTH_HASH_KEY = 'vox_auth_hash';
const AUTH_SESSION_KEY = 'vox_session_token';

/**
 * Hash a password using Web Crypto API with salt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hex-encoded hash
 */
async function hashPassword(password) {
  const salt = 'VANTAGE_ONYX_ZENITH_HORIZON_SALT_V1';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Generate a session token for the current session
 * @returns {string} - Session token
 */
function generateSessionToken() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

/**
 * Custom hook for password authentication
 * @returns {object} Auth state and handlers
 */
export function usePasswordAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication state on mount
  useEffect(() => {
    const storedHash = localStorage.getItem(AUTH_HASH_KEY);
    const sessionToken = sessionStorage.getItem(AUTH_SESSION_KEY);
    
    setHasPassword(!!storedHash);
    
    // Session-based auth: must verify each session
    if (storedHash && sessionToken) {
      setIsAuthenticated(true);
    }
    
    setIsChecking(false);
  }, []);

  /**
   * Create a new password (first-time setup)
   * @param {string} password - New password
   * @returns {Promise<boolean>} - Success status
   */
  const createPassword = useCallback(async (password) => {
    if (password.length < 6) {
      return false;
    }
    
    const hash = await hashPassword(password);
    localStorage.setItem(AUTH_HASH_KEY, hash);
    
    const sessionToken = generateSessionToken();
    sessionStorage.setItem(AUTH_SESSION_KEY, sessionToken);
    
    setHasPassword(true);
    setIsAuthenticated(true);
    
    return true;
  }, []);

  /**
   * Verify password against stored hash
   * @param {string} password - Password to verify
   * @returns {Promise<boolean>} - Whether password is correct
   */
  const verifyPassword = useCallback(async (password) => {
    const storedHash = localStorage.getItem(AUTH_HASH_KEY);
    if (!storedHash) return false;
    
    const inputHash = await hashPassword(password);
    
    if (inputHash === storedHash) {
      const sessionToken = generateSessionToken();
      sessionStorage.setItem(AUTH_SESSION_KEY, sessionToken);
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  }, []);

  /**
   * Clear session (logout for this session only)
   */
  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  /**
   * Reset password (removes stored hash)
   */
  const resetPassword = useCallback(() => {
    localStorage.removeItem(AUTH_HASH_KEY);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setHasPassword(false);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    hasPassword,
    isChecking,
    createPassword,
    verifyPassword,
    logout,
    resetPassword
  };
}

// ============================================================================
// COMMAND BAR STATE
// ============================================================================

/**
 * Custom hook for CLI command bar
 * @param {object} callbacks - Command callbacks
 * @returns {object} Command bar state and handlers
 */
export function useCommandBar(callbacks = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const COMMANDS = {
    'sync': {
      description: 'Force refresh all data',
      execute: () => callbacks.onSync?.()
    },
    'clear-cache': {
      description: 'Clear query cache',
      execute: () => callbacks.onClearCache?.()
    },
    'status': {
      description: 'Show system health status',
      execute: () => callbacks.onStatus?.()
    },
    'help': {
      description: 'List available commands',
      execute: () => callbacks.onHelp?.(Object.entries(COMMANDS).map(([cmd, info]) => 
        `> ${cmd} - ${info.description}`
      ).join('\n'))
    },
    'logout': {
      description: 'End current session',
      execute: () => callbacks.onLogout?.()
    }
  };

  const executeCommand = useCallback((input) => {
    const trimmed = input.trim().toLowerCase();
    const cmd = trimmed.startsWith('>') ? trimmed.slice(1).trim() : trimmed;
    
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const command = COMMANDS[cmd];
    if (command) {
      command.execute();
      return { success: true, command: cmd };
    }
    
    return { success: false, error: `Unknown command: ${cmd}` };
  }, [callbacks]);

  const navigateHistory = useCallback((direction) => {
    if (commandHistory.length === 0) return null;
    
    let newIndex = historyIndex;
    
    if (direction === 'up') {
      newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
    } else {
      newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
    }
    
    setHistoryIndex(newIndex);
    
    if (newIndex === -1) return '';
    return commandHistory[commandHistory.length - 1 - newIndex] || '';
  }, [commandHistory, historyIndex]);

  // Keyboard shortcut to toggle command bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    executeCommand,
    navigateHistory,
    commandHistory,
    availableCommands: Object.keys(COMMANDS)
  };
}
