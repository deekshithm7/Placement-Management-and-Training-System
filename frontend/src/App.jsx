import React from 'react'
import LoginPage from './pages/LoginPage'
import StudentRegister from './components/StudentRegister'
import ForgotPassword from './components/ForgotPassword'
import AlumniRegister from './components/AlumniRegister'

import { BrowserRouter,Routes,Route } from 'react-router-dom'



const App = () => (
  
  <BrowserRouter>
   <Routes>
    <Route path="/"element={<LoginPage/>}/>
    <Route path="/StudentRegister"element={<StudentRegister/>}/>
    <Route path="/AlumniRegister"element={<AlumniRegister/>}/>
    <Route path="/ForgotPassword"element={<ForgotPassword/>}/>
   </Routes>
  </BrowserRouter>
  
)

export default App
