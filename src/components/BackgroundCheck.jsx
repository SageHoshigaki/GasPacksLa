import React, { useState } from 'react';
import { useBackgroundCheck } from '../services/backgroundCheck';
import './BackgroundCheck.css';

const BackgroundCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkStatus, setCheckStatus] = useState(null);
  const { startCheck, checkStatus: getStatus, cancelCheck } = useBackgroundCheck();

  const handleStartCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = {
        firstName: e.target.firstName.value,
        lastName: e.target.lastName.value,
        dateOfBirth: e.target.dateOfBirth.value,
        ssn: e.target.ssn.value,
        email: e.target.email.value,
        phone: e.target.phone.value
      };

      const result = await startCheck(userData);
      setCheckStatus(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (checkId) => {
    setLoading(true);
    setError(null);

    try {
      const status = await getStatus(checkId);
      setCheckStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCheck = async (checkId) => {
    setLoading(true);
    setError(null);

    try {
      await cancelCheck(checkId);
      setCheckStatus(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background-check-container">
      <h2>Background Check</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!checkStatus ? (
        <form onSubmit={handleStartCheck}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ssn">Social Security Number</label>
            <input
              type="password"
              id="ssn"
              name="ssn"
              required
              pattern="[0-9]{9}"
              title="Please enter a valid 9-digit SSN"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Start Background Check'}
          </button>
        </form>
      ) : (
        <div className="check-status">
          <h3>Check Status: {checkStatus.status}</h3>
          <p>Check ID: {checkStatus.id}</p>
          <p>Started: {new Date(checkStatus.created_at).toLocaleString()}</p>
          <p>Package: {checkStatus.package}</p>
          
          <div className="status-actions">
            <button
              onClick={() => handleCheckStatus(checkStatus.id)}
              disabled={loading}
            >
              Refresh Status
            </button>
            <button
              onClick={() => handleCancelCheck(checkStatus.id)}
              disabled={loading || checkStatus.status === 'complete'}
            >
              Cancel Check
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundCheck; 