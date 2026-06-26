import React, { useState, useEffect, useRef } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';
import styles from './NotificationsDropdown.module.css';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      const results = data.results || [];
      setNotifications(results);
      setUnreadCount(results.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Обновлять каждые 30 секунд
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button className={styles.bellButton} onClick={toggleDropdown}>
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownHeader}>
            <span className={styles.title}>Notifications</span>
            {unreadCount > 0 && (
              <button className={styles.markAllRead} onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            )}
          </div>
          <div className={styles.notificationList}>
            {loading && <div className={styles.loading}>Loading...</div>}
            {!loading && notifications.length === 0 && (
              <div className={styles.empty}>No notifications</div>
            )}
            {!loading && notifications.map(notif => (
              <div
                key={notif.id}
                className={`${styles.notificationItem} ${!notif.is_read ? styles.unread : ''}`}
                onClick={() => handleMarkRead(notif.id)}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.message}>{notif.message}</div>
                  <div className={styles.meta}>
                    <span className={styles.type}>{notif.type}</span>
                    <span className={styles.time}>{formatDate(notif.created_at)}</span>
                  </div>
                </div>
                {!notif.is_read && <div className={styles.unreadDot} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;