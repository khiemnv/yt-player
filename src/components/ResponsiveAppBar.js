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
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { logout, selectRoleObj, selectUsername } from "../features/auth/authSlice";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import { useSelector } from "react-redux";
import { PlayVideoBox } from "./PlaylistManager";

const pages = [
  { text: "Home", icon: <HomeIcon />, url: "/", roles: ["admin", "user", "guest"] },
  { text: "User Manger", icon: <PeopleIcon />, url: "/usermanager", roles: ["admin"] },
  { text: "Settings", icon: <SettingsIcon />, url: "/setting",roles: ["admin", "user", "guest"] },
];

function ChatInput({ onChange }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onChange(message);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 0.5,
        pl: 1,
        pr: 1,
        borderRadius: 4,
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
      }}
    >
      <TextField
        fullWidth
        // multiline
        // maxRows={6}
        placeholder="Url..."
        variant="standard"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          disableUnderline: true,
        }}
        sx={{
          "& textarea": {
            resize: "none",
          },
        }}
      />

      {/* <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!message.trim()}
      >
        <SendIcon />
      </IconButton> */}
    </Paper>
  );
}

export function ResponsiveAppBar() {
  
  const playerRef = useRef(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const user = useSelector(selectUsername);
  const roleObj = useSelector(selectRoleObj);
  const userRole = roleObj ? roleObj.sys || "guest" : "guest";
  const availablePages = pages.filter((item) =>
    item.roles.includes(userRole)
  );
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
  
  const [search, setSearch] = useState("");
  const [playingVideo, setPlayingVideo] = useState(null);
  const handleSearch = value => {
    console.log(value)
    setSearch(value)
    setPlayingVideo({
      id: crypto.randomUUID(),
      videourl: value,
      startTime:0, 
      endTime:0 })
  }
  const handleClose=()=>{setPlayingVideo()}
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

          {/* input video */}
          <Box sx={{ m: 1, flexGrow: {xs:1, md: 0} }}>
            <Box sx={{ margin: "auto", maxWidth: "300px" }}>
              <ChatInput
                size="small"
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
              />
            </Box>
          </Box>
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

      {/* play video modal */}
      <Modal
        open={playingVideo}
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
