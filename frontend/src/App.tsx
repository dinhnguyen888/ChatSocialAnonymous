import React from "react";
import { Box, Grid } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FriendList from "./components/friendList";
import ChatBox from "./components/chatBox";
import MenuButton from "./components/menuButton";
import { SignUp } from "./components/SignUp";
import { Login } from "./components/SignIn";

import ChatApp from "./components/ChatApp";

const App: React.FC = () => {
  return (
    <ChatApp />
  );
};

export default App;
