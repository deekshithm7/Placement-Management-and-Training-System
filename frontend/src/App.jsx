// frontend/src/App.jsx
import React from 'react';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';

import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom';
import CoordinatorLayout from './components/Coordinator/CoordinatorLayout';
import CreateStudentAccount from './components/CreateStudentAccount';
import CreateTest from './components/Coordinator/CreateTest';
import HomePage from './pages/HomePage';
import AlumniLayout from './components/Alumni/AlumniLayout';
import ShareOpportunities from './components/Alumni/ShareOpportunities';
import ShareResources from './components/Alumni/ShareResources';
import Events from './components/Coordinator/Events';

import Notifications from './components/Student/Notifications'; // Ensure this import matches your file structure
import Feedback from './components/Alumni/Feedback';
import StudentLayout from './components/Student/StudentLayout';
import AdvisorLayout from './components/Advisor/AdvisorLayout';
import PlacementData from './components/Home/PlacementData';
import Recruiters from './components/Home/Recruiters';
import HomeLayout from './components/Home/HomeLayout';
import AptitudeTest from './components/Coordinator/AptitudeTest';
import Resources from './components/Coordinator/Resources';
import PlacementResults from './components/Coordinator/PlacementResults';
import StudentPlacementDrives from './components/Student/StudentPlacementDrives';
import ResourceAdd from './components/Student/ResourceAdd';
import Analytics from './components/Student/Analytics';
import EventAdd from './components/Student/EventAdd';
import JobOpportunities from './components/Student/JobOpportunities';
import ExamCorner from './components/Student/StudentAptitudeTests';
import PendingRequests from './components/Advisor/PendingRequests';
import ViewAnalysis from './components/Coordinator/ViewAnalysis';
import Contact from './components/Home/Contact';
import Gallery from './components/Home/Gallery';
import Procedure from './components/Home/Procedure';
import Testimonial from './components/Home/Testimonial';
import ProtectedRoute from './components/ProtectedRoute';
import StudentAddForm from './components/Advisor/AddStudent';
import StudentList from './components/Advisor/StudentList';
import EditStudent from './components/Advisor/EditStudent';
import AlumniRegister from './components/AlumniRegister';
import PlacementDriveDashboard from './components/Coordinator/PlacementDriveDashboard';
import PlacementDriveDetail from './components/Coordinator/PlacementDriveDetail';
import AddPlacementDrive from './components/Coordinator/AddPlacementDrive';
import StudentAptitudeTests from './components/Student/StudentAptitudeTests';
import TakeQuiz from './components/Student/TakeQuiz';
import QuizResults from './components/Student/QuizResults';
import ProtectedRouteWrapper from './components/ProtectedRouteWrapper';
import { AuthProvider } from './context/AuthContext';
import AdvisorManagement from './components/Coordinator/AdvisorManagement';
import ForgotPassword from './components/ForgotPassword';

import ResetPasswordForm from './components/ResetPasswordForm';

import ContactL from './components/Landing/Contact';
import PlacementDataPageL from './components/Landing/PlacementData';
import GalleryL from './components/Landing/Gallery';
import RecruitersL from './components/Landing/Recruiters';
import ProcedureL from './components/Landing/Procedure';
import TestimonialL from './components/Landing/Testimonial';
import HomeL from './components/Landing/Home';
import HomeLayoutL from './components/Landing/HomeLayout';

import Profile from './components/Student/Profile';

import PlacementDrives from './components/Advisor/PlacementDrives'; // Import the new component
const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="alumni-register" element={<AlumniRegister />} />

        <Route path="/" element={<HomeLayoutL />}>
          <Route index element={<HomeL />} />
          <Route path="Placementdata" element={<PlacementDataPageL />} />
          <Route path="Gallery" element={<GalleryL />} />
          <Route path="Recruiters" element={<RecruitersL />} />
          <Route path="Procedure" element={<ProcedureL />} />
          <Route path="Testimonial" element={<TestimonialL />} />
          <Route path="Contact" element={<ContactL />} />
        </Route>
        {/* Protected Routes */}
        <Route
          path="Alumni"
          element={<ProtectedRouteWrapper allowedRoles={['Alumni']} element={<AlumniLayout />} />}
        >
          <Route path="" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="placementData" element={<PlacementData />} />
            <Route path="recruiters" element={<Recruiters />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            <Route path="procedure" element={<Procedure />} />
            <Route path="testimonial" element={<Testimonial />} />
          </Route>
          <Route path="shareOpportunities" element={<ShareOpportunities />} />
          <Route path="shareResources" element={<ShareResources />} />
          <Route path="events" element={<Events />} />
        
          <Route path="notifications" element={<Notifications />} /> {/* Updated to match sidebar */}
          <Route path="feedback" element={<Feedback />} />
        </Route>

        <Route
          path="Coordinator"
          element={<ProtectedRouteWrapper allowedRoles={['Coordinator']} element={<CoordinatorLayout home={'Coordinator'} />} />}
        >
          <Route path="" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="placementData" element={<PlacementData />} />
            <Route path="recruiters" element={<Recruiters />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            <Route path="procedure" element={<Procedure />} />
            <Route path="testimonial" element={<Testimonial />} />
          </Route>
          <Route path="events" element={<Events />} />
          <Route path="resources" element={<Resources />} />
          <Route path="results" element={<PlacementResults />} />
          <Route path="aptitude-tests" element={<AptitudeTest />} />
          <Route path="create-test" element={<CreateTest />} />
          <Route path="viewAnalysis" element={<ViewAnalysis />} />
          <Route path="placement-drives" element={<PlacementDriveDashboard />} />
          <Route path="placement-drives/:id" element={<PlacementDriveDetail />} />
          <Route path="edit-test/:id" element={<CreateTest />} />
          <Route path="quiz-results/:id" element={<QuizResults />} />
          <Route path="addPlacementDrive" element={<AddPlacementDrive />} />
          <Route path="advisorManagement" element={<AdvisorManagement />} />
          <Route path="notifications" element={<Notifications />} /> {/* Added Notifications route */}
        </Route>

        <Route
          path="Student"
          element={<ProtectedRouteWrapper allowedRoles={['Student']} element={<StudentLayout />} />}
        >
          <Route path="" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="placementData" element={<PlacementData />} />
            <Route path="recruiters" element={<Recruiters />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            <Route path="procedure" element={<Procedure />} />
            <Route path="testimonial" element={<Testimonial />} />
          </Route>
          <Route path="placement" element={<StudentPlacementDrives />} />
          <Route path="resources" element={<ResourceAdd />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="events" element={<EventAdd />} />
          <Route path="jobs" element={<JobOpportunities />} />
          <Route path="aptitude-tests" element={<StudentAptitudeTests />} />
          <Route path="take-quiz/:id" element={<TakeQuiz />} />
          <Route path="quiz-results/:id" element={<QuizResults />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="Advisor"
          element={<ProtectedRouteWrapper allowedRoles={['Advisor']} element={<AdvisorLayout />} />}
        >
          <Route path="" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="placementData" element={<PlacementData />} />
            <Route path="recruiters" element={<Recruiters />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            <Route path="procedure" element={<Procedure />} />
            <Route path="testimonial" element={<Testimonial />} />
          </Route>
          <Route path="pendingRequests" element={<PendingRequests />} />
          <Route path="add-students" element={<StudentAddForm />} />
          <Route path="student-list" element={<StudentList />} />
          <Route path="edit-student/:id" element={<EditStudent />} />
          <Route path="notifications" element={<Notifications />} /> {/* Added Notifications route */}
          <Route path="placement-drives" element={<PlacementDrives />} /> {/* New route */}
        </Route>
      </>
    )
  );

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;