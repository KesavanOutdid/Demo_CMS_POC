import React, { useState } from 'react';
import axios from 'axios';
import { useHistory, Link } from 'react-router-dom'; // Import useHistory and Link

const Register = () => {
    const [registerUsername, setUserName] = useState('');
   // const [registerUseremail, setUserEmail] = useState('');
    const [registerPhone, setUserPhone] = useState('');
    const [registerPassword, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const history = useHistory();
   // alert(registerUsername);
	const handleRegister = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        try {
            const response = await axios.post('http://192.168.1.70:8052/RegisterNewUser', {
                registerUsername: registerUsername, registerPhone, registerPassword,
            });
            console.log(response.data); // Use console.log for debugging
            setMessage('User registered successfully');
            history.push('/');
        } catch (error) {
            console.error('Registration failed', error);
            setMessage('Registration failed');
        }
    };
      
	// const isValidPin = (pin) => {
	// 	// Use a regular expression to check if the pin is a 4-digit numeric value
	// 	const pinRegex = /^\d{4}$/;
	// 	return pinRegex.test(pin);
	// };
  return (
    <section className="h-100">
		<div className="container h-100">
			<div className="row justify-content-sm-center h-100">
				<div className="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9">
					<div className="text-center my-5">
						<img src="img/EV_Power_16-12-2023.png" alt="logo" width="250"/>
					</div>
					<div className="card shadow-lg">
						<div className="card-body p-5">
							<h1 className="fs-4 card-title fw-bold mb-4">Register</h1>
							<form onSubmit={handleRegister}>
								<div className="mb-3">
									<label className="mb-2 text-muted" htmlFor="name">User Name</label>
									<input type="text" className="form-control" value={registerUsername} onChange={(e) => setUserName(e.target.value)} required/>
									<div className="invalid-feedback">User Name is required</div>
								</div>
								{/* <div className="mb-3">
									<label className="mb-2 text-muted" htmlFor="email">E-Mail Address</label>
									<input type="email" className="form-control" value={registerUseremail} onChange={(e) => setUserEmail(e.target.value)} required/>
									<div className="invalid-feedback">
										Email is invalid
									</div>
								</div> */}
                                <div className="mb-3">
									<label className="mb-2 text-muted" htmlFor="Phone">Phone</label>
									<input type="text" className="form-control" value={registerPhone} onChange={(e) => setUserPhone(e.target.value)} required/>
									<div className="invalid-feedback">Phone is required	</div>
								</div>

								<div className="mb-3">
									<label className="mb-2 text-muted" htmlFor="password">Password</label>
									<input type="password" className="form-control"  value={registerPassword} onChange={(e) => setPassword(e.target.value)} required/>
								    <div className="invalid-feedback">
								    	Password is required
							    	</div>
								</div>
								{/* <div className="mb-3">
									<label className="mb-2 text-muted" htmlFor="password">Password</label>
									<input
										type="password"
										className={`form-control ${isValidPin(registerPassword) ? '' : 'is-invalid'}`}
										value={registerPassword}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
									<div className="invalid-feedback">
										{isValidPin(registerPassword) ? null : 'Please enter a 4-digit numeric pin.'}
									</div>
								</div>*/}

								<div className="align-items-center d-flex">
									<button type="submit" className="btn btn-primary ms-auto">Register</button>
								</div> 
							</form>
						</div>
						{message && (
							<p className="text-danger mt-3" id="loginErrorMessage" aria-live="assertive" aria-atomic="true" aria-describedby="email" style={{ textAlign: 'center' }}>
								{message}
							</p>
						)}					
						<div className="card-footer py-3 border-0">
							<div className="text-center">
								Already have an account? <Link to="/" className="text-dark">Login</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
  )
}

export default Register
