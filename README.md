# 🎓 Placement Management and Training System

A comprehensive **full-stack web application** built to modernize and streamline the **college placement and student training ecosystem**. This system offers **role-specific dashboards**, **automated aptitude testing**, **training resource sharing**, and **deep analytics** to empower students, coordinator, staff, and alumni in the placement lifecycle.

---

## 📌 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [🚀 Installation](#-installation)
- [👥 User Roles](#-user-roles)
- [📸 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

- 📚 **Training Resource Management**  
  Upload and categorize learning materials including **PDFs**, **video links**, and **external resources**. Easy access for students based on topic or type.

- 🧠 **Auto-Graded Aptitude Tests**  
  Practice and test aptitude skills in various topics. Results are **automatically evaluated**, with instant performance feedback.

- 📊 **Analytics Dashboard**  
  Visual analytics for **student progress**, **test performance**, **resource usage**, and **placement statistics**.

- 🔐 **Role-Based Access Control (RBAC)**  
  Different users access features based on their roles: **Students**, **Coordinators**, **Staff Advisors**, and **Alumni**.

- 🧑‍🎓 **Student Dashboard**  
  Personalized view of test scores, recommended resources, job postings, and notifications.

- 🧑‍🏫 **Staff Advisor Panel**  
  Review and approve student details, monitor academic performance, and provide feedback on placement readiness.

- 👨‍💼 **Coordinator Control Center**  
  Manage training resources, job openings, test creation, student data, and system-wide analytics.

- 👩‍💼 **Alumni Network Hub**  
  Share mentorship advice, post referral/job openings, and track interaction history with current students.

- 🔔 **Dynamic Notifications**  
  Alerts for upcoming tests, new job postings, deadlines, and training updates.

- 🔍 **Smart Filters & Search**  
  Advanced search across resources, jobs, and student records using filters by category, tags, or keywords.

---

## 🧰 Tech Stack

### 🔹 Frontend
- **React.js**
- **Tailwind CSS**
- **Axios**
- **Lucide-react** (Icons)

### 🔹 Backend
- **Node.js + Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Google OAuth**
- **Multer** (file uploads)
- **dotenv** (environment config)

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/deekshithm7/placement-management-system.git
cd placement-management-system
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `/backend` directory and add the following variables:

```env
PORT=8080
MONGO_URI=your_mongo_db_uri_here
SESSION_SECRET=your_session_secret_here

BREVO_EMAIL=your_brevo_email_here
BREVO_API_KEY=your_brevo_api_key_here

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

JWT_SECRET=your_jwt_secret_here

FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:8080
```
Run the server:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

> Frontend runs on `http://localhost:5173`  
> Backend runs on `http://localhost:8080`

---

## 👥 User Roles

| Role           | Description                                                                                          |
|----------------|--------------------------------------------------------------------------------------------------|
| 🧑‍🎓 Student      | Access training materials, take aptitude tests, view test scores, explore job listings, and track placement statistics. |
| 🧑‍💼 Coordinator  | Admin-equivalent role: manage student accounts, oversee test and training module creation, post jobs, and access analytics.   |
| 🧑‍🏫 Staff Advisor| Verify student academic data, provide feedback, approve student profiles, and monitor their placement readiness.             |
| 👨‍🎓 Alumni       | Offer mentorship, share job referrals, post opportunities, and interact with students via the alumni panel.                   |



## 📸 Screenshots

#### 🧑‍🎓 Student Dashboard
![Student Dashboard](\frontend\src\assets\Result\Screenshot 2025-04-08 231321.png)
---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repository
# Create a new branch (git checkout -b feature-name)
# Make your changes
# Commit (git commit -m "Add feature")
# Push (git push origin feature-name)
# Create a Pull Request
```

---

