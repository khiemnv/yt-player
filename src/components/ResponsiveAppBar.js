import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Input,
  InputAdornment,
  Menu,
  MenuItem,
  Modal,
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { logout, selectRoleObj, selectUsername } from "../features/auth/authSlice";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import { useSelector } from "react-redux";
import { PlayVideoBox } from "./PlaylistManager";

const pages = [
  { text: "Home", icon: <HomeIcon />, url: "/", roles: ["admin", "user", "guest"] },
  { text: "LHL", url: "/lhl", roles: ["admin", "user", "guest"] },
  { text: "User Manger", icon: <PeopleIcon />, url: "/usermanager", roles: ["admin"] },
  // { text: "Settings", icon: <SettingsIcon />, url: "/setting",roles: ["admin", "user", "guest"] },
];

function getPageTitle(pathname) {
  if (pathname === "/") return "My Playlists";
  if (pathname === "/lhl") return "LHL";
  if (pathname === "/tmh" || pathname.startsWith("/tmh/")) {
    return "Tu Mùa Hạ";
  }
  if (pathname.startsWith("/playlists/")) return "Playlist";
  return "YouTube Player";
}

function ChatInput({ onChange }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const value = message.trim();
    if (!value) return;
    onChange(value);
    setMessage("");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.5,
        px: 2,
        borderRadius: 4,
        border: 1,
        borderColor: "gray",
        display: "flex",
        alignItems: "center",
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Paste YouTube URL…"
        variant="standard"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSend();
          }
        }}
        slotProps={{
          input: {
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                {message && (
                  <IconButton
                    aria-label="Clear search content"
                    onClick={() => setMessage("")}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                <IconButton
                  aria-label="Search"
                  color="primary"
                  onClick={handleSend}
                  disabled={!message.trim()}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Paper>
  );
}


export function ResponsiveAppBar() {
  const playerRef = useRef(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const user = useSelector(selectUsername);
  const roleObj = useSelector(selectRoleObj);
  const userRole = roleObj ? roleObj.sys || "guest" : "guest";
  const availablePages = pages.filter((item) =>
    item.roles.includes(userRole)
  );
  const pageTitle = getPageTitle(location.pathname);
  const isPlaylistPage =
    location.pathname === "/" || location.pathname.startsWith("/playlists/");
  const settings = ['Logout'];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavMenuItemClick = (page) => {
    navigate(page.url);
  }

  const handleUserMenuItemClick = (setting) => {
    switch(setting) {
      case "Logout":
        dispatch(logout());
        break;
      default:
        break;
    }
  };

  const icon = <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            🎵
          </Typography>;
  const iconm = <Box  component="img" src="/logo192.png" sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, height: 32, width: 32 }} />;
  const icons = <Box  component="img" src="/logo192.png" sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, height: 32, width: 32 }} />;
  const [playingVideo, setPlayingVideo] = useState(null);
  const handleSearch = (value) => {
    setPlayingVideo({
      id: crypto.randomUUID(),
      videourl: value,
      startTime: 0,
      endTime: 0,
    });
  };
  const handleClose = () => setPlayingVideo(null);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {icons}
          {/* menu */}
          <Box sx={{ flexGrow: 0, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {availablePages.map((page) => (
                <MenuItem
                  key={page.text}
                  onClick={() => {
                    handleCloseNavMenu();
                    handleNavMenuItemClick(page);
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {page.text}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* {iconm} */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {availablePages.map((page, idx) => (
              <Button
                key={page.text}
                onClick={() => {
                  handleCloseNavMenu();
                  handleNavMenuItemClick(page);
                }}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page.text}
              </Button>
            ))}
          </Box>

          {isPlaylistPage ? (
            <Box sx={{ m: 1, flexGrow: { xs: 1, md: 0 }, maxWidth: "100%" }}>
              <ChatInput onChange={handleSearch} />
            </Box>
          ) : (
            <Box sx={{ m: 1, flexGrow: { xs: 1, md: 0 }, maxWidth: "100%", minWidth: 0, display: { md: "none" } } }>
              <Typography variant="h6" noWrap sx={{ textAlign: "center" }}>
                {pageTitle}
              </Typography>
            </Box>
          )}
          
          {/* User Avatar and Menu */}
          <Box sx={{ flexGrow: 0, ml: 1 }}>
            <Tooltip title={user}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user}>{user ? user[0].toUpperCase() : "?"}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    handleCloseUserMenu();
                    handleUserMenuItemClick(setting);
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>

      <Modal
        open={Boolean(playingVideo)}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleClose}
        >
          <PlayVideoBox playerRef={playerRef} video={playingVideo} />
        </Box>
      </Modal>
    </AppBar>
  );
}
