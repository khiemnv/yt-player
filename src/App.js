import logo from './logo.svg';
import './App.css';
import React from 'react'
import ReactPlayer from 'react-player'
import PlaylistManager from './components/PlaylistManager';

function App() {
  return (
    <PlaylistManager></PlaylistManager>

    // // Render a YouTube video player
    // <ReactPlayer src='https://www.youtube.com/watch?v=LXb3EKWsInQ' 
    // playing={true}
    // style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }} />
  );
}

export default App;
