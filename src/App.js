import { Routes, Route } from "react-router-dom";
import { useAppSelector } from "./app/hooks";
import { selectRoleObj, selectToken } from "./features/auth/authSlice";
import LoginPage from "./pages/LoginPage";
import { Box, createTheme, ThemeProvider, useMediaQuery } from "@mui/material";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import PlaylistDashboard from "./pages/PlaylistDashboard";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar";
import PlaylistDetail from "./pages/PlaylistDetail";

export function useMobileVh() {
  useEffect(() => {
    function updateVh() {
      const vh = window.visualViewport
        ? window.visualViewport.height * 0.01
        : window.innerHeight * 0.01;

      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    updateVh();

    window.visualViewport?.addEventListener("resize", updateVh);
    window.addEventListener("resize", updateVh);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateVh);
      window.removeEventListener("resize", updateVh);
    };
  }, []);
}

function App() {
  console.log("App render");
  useMobileVh();

  // All available tags (from API or from store) used to suggest options
  const dispatch = useDispatch();
  const token = useAppSelector(selectToken);

  const isMobile = useMediaQuery('(max-width:600px)');
  const roleObj = useAppSelector(selectRoleObj);
  if (!token) {
    return <LoginPage></LoginPage>;
  }

  const theme = createTheme({
    spacing: isMobile ? 4 : 8,
    components: {
      MuiCard: { // Target the Card component
        styleOverrides: {
          root: {
            // // Apply padding that uses theme breakpoints
            // padding: '16px', // default padding
            // '@media (min-width: 600px)': { // sm breakpoint
            //   padding: '8px',
            // },
            // '@media (min-width: 900px)': { // md breakpoint
            //   padding: '24px',
            // },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            // size: isMobile ? "small" : "medium"
          }
        }
      }
      // You can add overrides for other components here (e.g., MuiButton, MuiPaper)


    },
  });

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar />

      <Box sx={{ display: "flex", flexDirection: "column", height: "50vh", flexGrow: 1 }}>
        {/* <Header /> */}
        <main style={{ minHeight: "50vh", display: "flex", flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<PlaylistDashboard />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
          </Routes>
        </main>
        {/* <Footer /> */}
      </Box>
    </ThemeProvider>
  );
}

export default App;
