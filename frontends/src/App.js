import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import ChargerDashboard from './pages/ChargerDashboard';

const App = () => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  const [loggedIn, setLoggedIn] = useState(!!storedUser);
  const [ChargerID, setUserChargerID] = useState(storedUser ? storedUser.ChargerID : null);
  const [Username, setUserUsername] = useState(storedUser ? storedUser.Username : null);

  const [userInfo, setUserInfo] = useState(storedUser || {});
  const [initialLoad, setInitialLoad] = useState(false);

  useEffect(() => {
    setInitialLoad(true);
  }, []);

  const handleLogin = (data, username) => {
    setUserInfo({ username });
    setLoggedIn(true);
    sessionStorage.setItem('user', JSON.stringify({ username }));
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserInfo({});
    sessionStorage.removeItem('user');
  };

  const handleChargerID = (data, searchChargerID, username) => {
    // Set ChargerID and Username in state
    setUserChargerID(searchChargerID);
    setUserUsername(username);
  
    // Save user data with ChargerID and Username
    const updatedUser = { ...storedUser, ChargerID: searchChargerID, Username: username };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  
    // Redirect to ChargerDashboard after setting ChargerID
    window.location.href = '/chargerDashboard';
  };

  return (
    <Router>
      <Route path="/register" component={Register} />

      {/* Redirect to Home if logged in, otherwise show Login */}
      <Route exact path="/">
        {loggedIn ? <Redirect to="/Home" /> : <Login handleLogin={handleLogin} />}
      </Route>

      {/* Home route */}
      <Route path="/Home">
        {loggedIn ? (
          initialLoad ? (
            <Home userInfo={userInfo} handleLogout={handleLogout} handleChargerID={handleChargerID} />
          ) : (
            <Home userInfo={userInfo} handleLogout={handleLogout} setInitialLoad={setInitialLoad} />
          )
        ) : (
          <Redirect to="/" />
        )}
      </Route>

      {/* Redirect to ChargerDashboard if logged in, otherwise show Login */}
      <Route exact path="/chargerDashboard">
        {loggedIn ? <ChargerDashboard Username={Username} ChargerID={ChargerID} handleLogout={handleLogout} /> : <Redirect to="/" />}
      </Route>
    </Router>
  );
};

export default App;
