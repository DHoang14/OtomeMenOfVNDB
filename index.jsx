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
import TagInfo from "./pages/TagInfo"
import Men, { loader as menLoader, action as menAction } from "./pages/Men/Men"
import ManDetail, { loader as manDetailLoader } from "./pages/Men/ManDetail"
import NotFound from "./pages/NotFound"
import Layout from "./components/Layout"
import Error from "./components/Error"

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

    <Route path="*" element={<NotFound />} />
  </Route>
))

function App() {
  return (
    <RouterProvider router={router} />
  )
}

ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<App />);