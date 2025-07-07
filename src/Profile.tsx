import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { User, Mail, Edit, ArrowLeft } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from './firebase';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, firebaseUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);

  // Update displayName state when user changes
  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    console.log('Save button clicked');
    setIsLoading(true);
    try {
      console.log('Saving profile data:', { displayName, email: user?.email });
      
      if (user && firebaseUser) {
        // Update Firebase Auth profile
        if (displayName !== user.displayName) {
          await updateProfile(firebaseUser, {
            displayName: displayName
          });
          console.log('Firebase Auth profile updated');
        }
        
        // Save to Firestore
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, {
          displayName: displayName,
          email: user.email,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log('Profile saved successfully');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
  };

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={handleBackToDashboard}>
          <ArrowLeft />
          Back to Dashboard
        </button>
        <h1>Profile Settings</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <User />
          </div>

          <div className="profile-info">
            <div className="profile-field">
              <label>Display Name</label>
              {isEditing ? (
                <div className="edit-field">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                  />
                </div>
              ) : (
                <div className="field-value">
                  <span>{displayName || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="profile-field">
              <label>Email</label>
              <div className="field-value">
                <Mail />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="profile-field">
              <label>Account Type</label>
              <div className="field-value">
                <span>{user.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 'Email/Password'}</span>
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <div className="edit-actions">
                  <button 
                    className="save-button" 
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="edit-button" onClick={handleEdit}>
                  <Edit />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-actions-card">
          <h3>Account Actions</h3>
          <button className="signout-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 