import React from 'react';
import AdminPage from './AdminPage';
import UserPage from './UserPage';

const Home = () => {
  const role = localStorage.getItem('userRole');

  const renderContent = () => {
    if (role === 'ADMIN') {
      return <AdminPage />;
    } else if (role === 'USER') {
      return <UserPage />;
    } else {
      return <h1>Please log in.</h1>;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  )
}

export default Home;
