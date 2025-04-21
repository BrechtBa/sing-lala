import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';

import { ListSongs } from './ListSongs';
import { EditSong, MeasureSongTiming, PlaySong } from './Song';

import './App.css'


function Layout() {
  return (
    <div style={{height: "90%"}}>
      <Outlet />
    </div>
  );
}


const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: ListSongs },
      { path: ":id", Component: PlaySong },
      { path: ":id/edit", Component: EditSong },
      { path: ":id/edit/timing", Component: MeasureSongTiming },
    ],
  },
]);



export default function App() {
  return (
    <RouterProvider router={router} />
  )
}