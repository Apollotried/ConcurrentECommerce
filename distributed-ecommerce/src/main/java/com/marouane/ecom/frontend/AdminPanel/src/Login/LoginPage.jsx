import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {AuthContext} from ".././Context/AuthContext.jsx";
import {login} from "../api/loginApi.js";
import {jwtDecode} from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import './LoginPage.css';


const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setIsAuthenticated, setUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const loginRequestDTO = {email, password};
            const response = await login(loginRequestDTO);

            if (response && response.token){
                localStorage.setItem('token', response.token);
                const decodedToken = jwtDecode(response.token);
                const username = decodedToken.sub;
                const role = decodedToken.authorities;
                setUserProfile({username, role});
                setIsAuthenticated(false);

                toast.success('Login successful!');
                if (role.includes("ADMIN")){
                    navigate('/admin');
                }else {
                    console.log(role);
                    toast.info('this is not an admin account');
                }
            }else {
                throw new Error('Login failed. No token received.');
            }
        }catch (error){
            console.error('Login failed', error);
            toast.error('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="loginContainer">
            <ToastContainer/>
            <section className="right">
                <h1>
                    <span>❝</span> Build, Manage, and Scale <br/>
                    Your E-Commerce Platform with Ease
                </h1>
            </section>

            <section className="left">
                <div className="wrap">
                    <form onSubmit={handleLogin}>
                        <h1>Login</h1>

                        <div className="box">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <i className="bx bxs-user"></i>
                        </div>

                        <div className="box">
                            <input
                                type="password"
                                name="pwd"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <i className="bx bxs-lock-alt"></i>
                        </div>

                        <button type="submit" className="btn">Login</button>
                    </form>
                </div>
            </section>
        </div>
    );
};
export default LoginPage;