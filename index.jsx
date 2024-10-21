import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route
} from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import LoginLayout from './components/LoginLayout';
import Login, { action as loginAction } from "./pages/Login"
import Register, { action as registerAction } from './pages/Register';
import ForgotLoginInfo, { action as forgotAction } from './pages/ForgotLoginInfo';
import ResetPassword, { loader as resetLoader, action as resetAction } from './pages/ResetPassword';
import ResetPasswordStatus, { loader as resetStatusLoader} from './pages/ResetPasswordStatus';
import TagInfo from "./pages/TagInfo"
import Men, { loader as menLoader, action as menAction } from "./pages/Men/Men"
import ManDetail, { loader as manDetailLoader } from "./pages/Men/ManDetail"
import NotFound from "./pages/NotFound"
import Layout from "./components/Layout"
import Error from "./components/Error"
import { AccessTokenProvider } from "./context/accessTokenContext"
import { UserContextProvider } from './context/userContext';

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route
      path="men"
      element={<Men />}
      errorElement={<Error />}
      loader={menLoader}
      action={menAction}
    />
    <Route 
      path="men/:id" 
      element={<ManDetail />} 
      errorElement={<Error />}
      loader={manDetailLoader}
    />
    <Route path="tags" element={<TagInfo />} />
    <Route path="login" element={<LoginLayout />}>
      <Route
        index
        element={<Login />}
        action={loginAction}
      />
      <Route 
        path="register"
        element={<Register />}
        action={registerAction}
      />
    </Route>
    <Route
      path="forgotLogin"
      element={<ForgotLoginInfo />}
      action={forgotAction} 
    />
    <Route
      path="reset/:token"
      element={<ResetPassword />}
      loader={resetLoader}
      action={resetAction}
    />
    <Route 
      path="reset/:token/:result"
      element={<ResetPasswordStatus />}
      loader={resetStatusLoader}
    />
    <Route path="*" element={<NotFound />} />
  </Route>
))

function App() {
  return (
    <UserContextProvider>
      <AccessTokenProvider>
        <RouterProvider router={router} />
      </AccessTokenProvider>
    </UserContextProvider>
  )
}

ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<App />);