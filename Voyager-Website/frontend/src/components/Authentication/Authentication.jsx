import React, {useEffect, useState} from 'react';
import "./Auth.css";
import authService from '../../services/authService';

const Auth = ({isLogin: initialIsLogin = true, onLoginSuccess}) => {
    const [isLogin, setIsLogin] = useState(initialIsLogin);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        nativeLanguage: 'en',
        learningLanguage: 'es',
        proficiencyLevel: 'beginner'
    });

    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState('');

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'password'){
            checkPasswordStrength(value);
        }

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const checkPasswordStrength = (password) => {
        if (password.length === 0) {
            setPasswordStrength('');
            return;
        }
        
        // password strength checker regex
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;
        
        const strength = 
            (hasUpperCase ? 1 : 0) +
            (hasLowerCase ? 1 : 0) +
            (hasNumbers ? 1 : 0) +
            (hasSpecialChar ? 1 : 0) +
            (isLongEnough ? 1 : 0);
          
        if (strength < 2) setPasswordStrength('weak');
        else if (strength < 4) setPasswordStrength('medium');
        else setPasswordStrength('strong');
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic validation
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        
        if (!isLogin) {
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        } else {
        if (!formData.password) newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSumbit = async (e) => {
        e.preventDefault();

        if(!validateForm()) return;

        setIsLoading(true);

        try{
            let data;

            if(isLogin){
                const credentials = {
                    username: formData.username,
                    password: formData.password
                };
                data = await authService.login(credentials);
            } else{
                data = await authService.register(formData);
            }

            authService.setAuthData(data.token, data.user); 

            if(onLoginSuccess){
                onLoginSuccess(data.token, data.user);
            } else{
                window.location.href ="/";
            }
        } catch(error){
            setErrors({ form: error.response?.data?.message ||  (isLogin ? "Login failed" : "Registration failed") });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin); 
        setErrors({}); 
    };

    return (
        <div className="auth-container">
          <div className="auth-card">
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            
            {errors.form && <div className="error-message">{errors.form}</div>}
            
            <form onSubmit={handleSumbit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
              
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
                
                {passwordStrength && (
                  <div className={`password-strength ${passwordStrength}`}>
                    Password strength: {passwordStrength}
                  </div>
                )}
              </div>
              
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && (
                      <span className="error-text">{errors.confirmPassword}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="nativeLanguage">Native Language</label>
                    <select
                      id="nativeLanguage"
                      name="nativeLanguage"
                      value={formData.nativeLanguage}
                      onChange={handleChange}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      {/* Add more language options */}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="learningLanguage">Learning Language</label>
                    <select
                      id="learningLanguage"
                      name="learningLanguage"
                      value={formData.learningLanguage}
                      onChange={handleChange}
                    >
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="en">English</option>
                      {/* Add more language options */}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="proficiencyLevel">Proficiency Level</label>
                    <select
                      id="proficiencyLevel"
                      name="proficiencyLevel"
                      value={formData.proficiencyLevel}
                      onChange={handleChange}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </>
              )}
              
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (isLogin ? 'Logging in....' : 'Signing Up....') : (isLogin ? "Login ": "Sign Up")}
              </button>
            </form>
            
            <div className="toggle-form">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={toggleForm}
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    };

export default Auth;

