import { createBrowserRouter } from "react-router";
import { Intro } from "./components/Intro";
import { Register  } from "./components/Register";
import { StoryPage1 } from "./components/StoryPage1";
import { StoryPage2 } from "./components/StoryPage2";
import { Level1 } from "./components/Level1";
import { Level2 } from "./components/Level2";
import { Level3 } from "./components/Level3";
import { Level4 } from "./components/Level4";
import { Level5 } from "./components/Level5";
import { Level6 } from "./components/Level6";
import { Victory } from "./components/Victory";
import {Ranking} from "./components/Ranking";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Intro/>,
  },
   {
    path: "/intro",
    element: <Intro/>,
  },
  {path: "/register",
   element: <Register/>,
  },
  {
    path: "/story-1",
    element: <StoryPage1/>,
  },
  {
    path: "/story-2",
    element: <StoryPage2/>,
  },
  {
    path: "/level-1",
    element: <Level1/>,
  },
  {
    path: "/level-2",
    element: <Level2/>,
  },
  {
    path: "/level-3",
    element: <Level3/>,
  },
  {
    path: "/level-4",
    element: <Level4/>,
  },
  {
    path: "/level-5",
    element: <Level5/>,
  },
  {
    path: "/level-6",
    element: <Level6/>,
  },
  {
    path: "/victory",
    element: <Victory/>,
  },
  {
    path: "/ranking",
    element: <Ranking/>,
  }
]);