import React, { useState } from "react";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
 import { useEffect } from "react";

const AlumniDashboard = () => {
  const [username] = useState("Username");
  const [notifications, setNotifications] = useState([
    { id: 1, type: "Job Posting", message: "New job posting: Software Engineer at ABC Corp.", timestamp: "2023-11-20 10:00 AM", read: false },
    { id: 2, type: "Event Reminder", message: "Reminder: Alumni Meetup on 2023-11-25 at 10:00 AM.", timestamp: "2023-11-19 09:00 AM", read: false },
    { id: 3, type: "Job Posting", message: "New job posting: Software Engineer at ABC Corp.", timestamp: "2023-11-20 10:00 AM", read: false },
    { id: 4, type: "Job Posting", message: "New job posting: Software Engineer at ABC Corp.", timestamp: "2023-11-20 10:00 AM", read: false },
    { id: 5, type: "Job Posting", message: "New job posting: Software Engineer at ABC Corp.", timestamp: "2023-11-20 10:00 AM", read: false },
    { id: 6, type: "Job Posting", message: "New job posting: Software Engineer at ABC Corp.", timestamp: "2023-11-20 10:00 AM", read: false },

  ]);

  

  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    // Code to run on component mount or state change
    console.log({unreadCount});
  
    return () => {
      // Cleanup code (runs before the component unmounts)
      console.log("Component will unmount");
    };
  }, [unreadCount]);


 
};

export default AlumniDashboard;