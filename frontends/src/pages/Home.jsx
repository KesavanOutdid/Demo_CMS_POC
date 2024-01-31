import React, { useEffect, useState } from 'react';

const Home = ({ userInfo, handleLogout, handleChargerID }) => {
  const [walletBalance, setWalletBalance] = useState(null);
  const [searchChargerID, setChargerID] = useState('');
  const username = userInfo.username;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://192.168.1.70:8052/GetWalletBalance?username=${username}`);
        const data = await response.json();
        setWalletBalance(data.balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    fetchData();
  }, [username]);

  const handleSearchRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://192.168.1.70:8052/SearchCharger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchChargerID, username }),
      });

      if (response.ok) {
        const data = await response.json();
        //alert(data.message);
        // alert(searchChargerID);
        handleChargerID(data, searchChargerID, username);
      } else {
        const errorData = await response.json();
        alert(errorData.message);

      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <span className="navbar-brand">EV Power {username}</span>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            {/* Logout Form in Navbar */}
            <li className="nav-item">
              <form className="form-inline" onClick={handleLogout}>
                <button type="button" className="btn btn-danger">Logout</button>
              </form>
            </li>
          </ul>
        </div>
      </nav>

      {/* Container for Page Content */}
      <div className="container mt-4">
        {/* Wallet Section */}
        <div className="col-md-12" >
          <div className="card">
            <div className="card-body">
              <blockquote className="blockquote">
                <div className="card mb-4">
                  <div className="card-body" style={{paddingTop:'0px', paddingBottom:'0px'}}>
                    <h2 className="card-title">My Wallet</h2>
                      <div>
                        {walletBalance !== null ? (
                          <p>Balance: Rs. {walletBalance}</p>
                        ) : (
                          <p>Loading wallet balance...</p>
                        )}
                      </div>
                  </div>
                </div>
              </blockquote>
            </div>
          </div>
        </div>
        

        {/* Charger Search Box Section */}
        <div className="col-md-12" >
          <div className="card">
            <div className="card-body">
              <blockquote className="blockquote">
                <div className="card">
                  <div className="card-body" style={{paddingTop:'0px', paddingBottom:'0px'}}>
                    <h2 className="card-title">Search Charger</h2>
                    <form onSubmit={handleSearchRequest}>
                      <div className="form-group">
                        <label htmlFor="chargerID">ChargerID:</label>
                        <input type="text" className="form-control" id="chargerID" name="chargerID" value={searchChargerID} onChange={(e) => setChargerID(e.target.value)} placeholder="Enter ChargerID" />
                      </div>
                      <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                  </div>
                </div>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Add any other sections or content as needed */}
      </div>
    </div>
  );
};

export default Home;
