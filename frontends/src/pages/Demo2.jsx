import React, { useState, useEffect} from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const ChargerDashboard = ({ Username, handleLogout, ChargerID }) => {
  const [isTableVisible, setIsTableVisible] = useState(false);
  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  const [isDeviceInDatabase, setIsDeviceInDatabase] = useState(false);
  const [ChargerStatus, setChargerStatus] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [serialNumber, setSerialNumber] = useState(1);
  const [checkFault, setCheckFault] = useState(false);
  const [errorCode, seterrorCode] =useState('');
  useEffect(() => {
    const textBox = document.getElementById('chargerID');

    if (!ChargerID) {
      const appendedValue = 'Please enter a valid URL';
      textBox.value += appendedValue;
    } else {
      textBox.value += ChargerID;
    }

    console.log('Ready !');
    // Instead of setting isDeviceInDatabase directly, use state
    setIsDeviceInDatabase(true);
  }, [ChargerID]);

  useEffect(() => {
    const fetchLastStatus = async () => {
      try {
        const response = await fetch('http://192.168.1.70:8052/FetchLaststatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: ChargerID }),
        });

        if (response.ok) {
          const data = await response.json();
          const status = data.message.status;
          const formattedTimestamp = formatTimestamp(data.message.timestamp);

          // Update state with fetched data
          setChargerStatus(status);
          setTimestamp(formattedTimestamp);
          AppendStatusTime(status, formattedTimestamp);
        } else {
          // Handle error scenario
          console.error(`Failed to fetch status. Status code: ${response.status}`);
        }
      } catch (error) {
        // Handle general error
        console.error(`Error while fetching status: ${error.message}`);
      }
    };

    fetchLastStatus();
  }, [ChargerID]);

  useEffect(() => {
    const socket = new WebSocket('ws://122.166.210.142:8050');

    // Event listener for when the WebSocket connection is opened
    socket.addEventListener('open', (event) => {
      console.log('WebSocket connection opened:', event);
    });

    // Event listener for when a message is received from the WebSocket server
    socket.addEventListener('message', (response) => {
      const parsedMessage = JSON.parse(response.data);
      let ChargerStatus;
     let CurrentTime;
      let errorCode;
      let user = Username;
      const { DeviceID, message } = parsedMessage;

      //console.log(message + ' parsedMessage datas');
    //  console.log(ChargerID + ' ChargerID');
      if (isDeviceInDatabase && DeviceID === ChargerID) {
        switch (message[2]) {
          case 'StatusNotification':
            ChargerStatus = message[3].status;
            CurrentTime = formatTimestamp(message[3].timestamp);
            const seterrorCode = message[3].errorCode;
            console.log(`ChargerID ${DeviceID}: {"status": "${ChargerStatus}","time": "${CurrentTime}","error": "${errorCode}"}`);

            if (errorCode !== 'NoError') {
              const errorhistory = (
                '<tr>' +
                '<td>' + serialNumber + '</td>' +
                '<td>' + CurrentTime + '</td>' +
                '<td>' + ChargerStatus + '</td>' +
                '<td>' + errorCode + '</td>' +
                '</tr> '
              );

              // Update error history in your React state or perform any other relevant action
              serialNumber++;
              checkFault = true;
            } else {
              checkFault = false;
            }
            break;

          case 'Heartbeat':
            CurrentTime = getCurrentTime();
             console.log(CurrentTime) ;   
    // Update timestamp in your React state or perform any other relevant action
            break;

          case 'MeterValues':
            errorCode = 'NoError';
            const meterValues = message[3].meterValue;
            const sampledValue = meterValues[0].sampledValue;
            const formattedJson = convertToFormattedJson(sampledValue);

            // Update UI with meter values
            // You can use state to store these values and update the state
            // Update voltage, current, power, energy, frequency, and temperature in your React state or perform any other relevant action

            ChargerStatus = 'Charging';
            CurrentTime = getCurrentTime();
            break;

          case 'Authorize':
            if (checkFault === false) {
              ChargerStatus = 'Authorized';
            }
            CurrentTime = getCurrentTime();
            break;

          case 'FirmwareStatusNotification':
            ChargerStatus = message[3].status.toUpperCase();
            break;

          case 'StopTransaction':
            ChargerStatus = 'Finishing';
            // Update UI or perform any other relevant action
            // You may want to use state to manage the UI state
            CurrentTime = getCurrentTime();
            setTimeout(function () {
              updateSessionPriceToUser(ChargerID, user);
            }, 5000);
            break;

          // Handle other cases as needed

          case 'Accepted':
            ChargerStatus = 'ChargerAccepted';
            CurrentTime = getCurrentTime();
            break;
        }
      }

      if (ChargerStatus) {
        AppendStatusTime(ChargerStatus, CurrentTime);
      }
    });

    // Event listener for when the WebSocket connection is closed
    socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed:', event);
    });

    // Event listener for WebSocket errors
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });

    // Clean up the WebSocket connection when the component is unmounted
    return () => {
      socket.close();
    };
  }, [ChargerID, isDeviceInDatabase]);


  const getCurrentTime = () => {
    const currentDate = new Date();
    const currentTime = currentDate.toISOString();
    return formatTimestamp(currentTime);
  };

  const formatTimestamp = (originalTimestamp) => {
    const date = new Date(originalTimestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Function to convert the structure
  const convertToFormattedJson = (measurandArray) => {
    const formattedJson = {};
    measurandArray.forEach(measurandObj => {
      const key = measurandObj.measurand;
      const value = measurandObj.value;
      formattedJson[key] = value;
    });
    return formattedJson;
  };

  // start button
  const handleStartTransaction = async () => {
    try {
      const response = await fetch('http://192.168.1.70:8052/start', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: ChargerID }),
      });

      if (response.status === 200) {
        console.log(response.message);
        console.log('ChargerStartInitiated');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  // stop button
  const handleStopTransaction = async () => {
    try {
      const response = await fetch('http://192.168.1.70:8052/stop', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: ChargerID }),
      });

      if (response.status === 200) {
        console.log('ChargerStopInitiated');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  // Your other functions can be converted as needed
  const AppendStatusTime = (ChargerStatus, CurrentTime) => {
    // Update the state variables accordingly
    // Assuming you have state variables to store ChargerStatus and timestamp
    setChargerStatus(ChargerStatus);
    setTimestamp(CurrentTime);

    // Update the DOM elements as needed
    const startButton = document.getElementById("startTransactionBtn");
    const stopButton = document.getElementById("stopTransactionBtn");

    startButton.disabled = ChargerStatus === 'Preparing' ? false : true;
    stopButton.disabled = ChargerStatus === 'Charging' ? false : true;
  };

  const updateSessionPriceToUser = async (ChargerID, user) => {
    try {
      const response = await fetch('http://192.168.1.70:8052/getUpdatedCharingDetails', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chargerID: ChargerID,
          user: user,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let chargingSession = data.chargingSession;
        let updatedUser = data.user;

        let chargerID = chargingSession.ChargerID;
        let startTime = chargingSession.StartTimestamp;
        let stopTime = chargingSession.StopTimestamp;
        let unitConsumed = chargingSession.Unitconsumed;
        let chargingPrice = chargingSession.price;
        let username = chargingSession.user;
        let availableBalance = updatedUser.walletBalance;

        console.log(`Update successful: ChargerID: ${chargerID}, Unit Consumed: ${unitConsumed}, Price: ${chargingPrice}, Wallet Balance: ${availableBalance}`);
      } else {
        console.error('Update failed:', response.statusText);
      }
    } catch (error) {
      console.error('Update failed:', error.message);
    }
  };
  return (
    <div className="container-scroller">
    {/* <!-- partial:partials/_navbar.html --> */}
    <Header />
    {/* partial */}
    <div className="container-fluid page-body-wrapper">
      {/* partial */}
      {/* partial:partials/_sidebar.html */}
      <Sidebar />
      {/* partial */}
      <div className="main-panel">
        <div className="content-wrapper">
          <div className="row">
            <div className="col-md-10 grid-margin">
              <div className="row">
                <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                  <h3 className="font-weight-bold">Welcome <span className="text-primary">{Username}</span></h3>
                </div>
              </div>
            </div>
            <div className="col-md-2 grid-margin">
              <div className="row">
                <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                <button type="button" className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
            <hr></hr>
          </div>
          <div className="row">
            <div className="col-md-12 grid-margin stretch-card" style={{textAlign:'center'}}>
              <div className="card">
                <div className="card-body">
                  <blockquote className="blockquote">
                    <p className="text-primary"><span style={{fontSize:'x-large'}}>CHARGER STATUS</span></p>
                    <p><span style={{fontSize:'x-large'}}>{ChargerStatus}</span></p>
                    <p><span style={{fontSize:'x-large'}}>{timestamp}</span></p>
                    <h3 style={{margin: 'auto', width: '100%', padding: '10px'}}>
                      <input type="text" id="chargerID" className="text-primary" style={{width: '100%', textAlign: 'center'}}  readOnly/>
                    </h3>
                  </blockquote>
                </div>
              </div>
            </div>
            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title" style={{textAlign: 'center', paddingTop: '25px'}}>Voltage : <span id="voltage"></span></h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title"  style={{textAlign: 'center', paddingTop: '25px'}}>Current : <span id="current"></span></h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title"  style={{textAlign: 'center', paddingTop: '25px'}}>Power : <span id="power"></span></h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title"  style={{textAlign: 'center', paddingTop: '25px'}}>Energy : <span id="energy"></span></h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title"  style={{textAlign: 'center', paddingTop: '25px'}}>Frequency : <span id="frequency"></span></h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title"  style={{textAlign: 'center', paddingTop: '25px'}}>Temperature : <span id="temperature"></span></h2>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 grid-margin stretch-card">
            <div className="card">
              <div className="row">
                <div className="col-md-6">
                  <div className="card-body"  style={{textAlign: 'center', paddingTop: '25px'}}>
                    <button type="button" className="btn btn-success btn-sm"><span style={{fontSize:'30px'}} id="startTransactionBtn" onClick={handleStartTransaction} disabled={ChargerStatus !== 'Preparing'}><b>START</b></span></button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card-body" style={{textAlign: 'center', paddingTop:'30px'}}>
                    <button type="button" className="btn btn-danger btn-sm"><span style={{fontSize:'30px'}} id="stopTransactionBtn" onClick={handleStopTransaction} disabled={ChargerStatus !== 'Charging'}><b>STOP</b></span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="card-body" style={{textAlign: 'center', paddingTop:'30px'}}>
              <button type="button" className="btn btn-primary btn-sm btn-show-error-history"  onClick={toggleTableVisibility}>
                <span style={{fontSize:'30px'}}><b>{isTableVisible ? 'Hide Error History' : 'Show Error History'}</b></span>
              </button>
            </div>
          </div>
          {isTableVisible && (
          <div className="col-lg-12 grid-margin stretch-card table-responsive-click">
            <div className="card">
              <div className="card-body">
                <div className="table-container">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Sl.No</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody id="errorhistory">
                      {/* <tr>
                        <td>1</td>
                        <td>02:07 pm</td>
                        <td>Ok</td>
                        <td>{errorCode}</td>
                      </tr> */}
                      {/* <tr>
                        <td>2</td>
                        <td>02:07 pm</td>
                        <td>Ok</td>
                        <td>Error</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>02:07 pm</td>
                        <td>Ok</td>
                        <td>Error</td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>02:07 pm</td>
                        <td>Ok</td>
                        <td>Error</td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>02:07 pm</td>
                        <td>Ok</td>
                        <td>Error</td>
                      </tr>
                      <tr>
                        <td>6</td>
                        <td>02:07 pm</td>
                        <td>Ok</td>
                        <td>Error</td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
           )}
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <p className="card-title">Note:</p>
                <div className="row">
                  <div className="col-12 card card-light-danger">
                    <div className="table-responsive">
                      <div className="danger" style={{paddingLeft: '10px', paddingBottom:'5px', color: 'black'}}>
                        <h4 style={{paddingTop:'20px'}}><u>Threshold Level</u></h4>
                        <p><strong>Voltage level : </strong> Input under voltage - 175V and below. &nbsp;&nbsp;&nbsp;Input over voltage - 270V and above.</p>
                        <p><strong>Current :</strong> Over Current - 33A.</p>
                        <p><strong>Frequency :</strong> Under frequency - 47HZ. &nbsp;&nbsp;&nbsp;Over frequency - 53HZ.</p>
                        <p><strong>Temperature :</strong> Low Temperature - 0 °C. &nbsp;&nbsp;&nbsp; High Temperature - 58 °C.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*  content-wrapper ends  */}
        {/*  partial:partials/_footer */}
        <Footer />
        {/*  partial */}
      </div>
      {/* main-panel ends */}
    </div>   
    {/* page-body-wrapper ends */}
  </div>
 
  )
}

export default ChargerDashboard
