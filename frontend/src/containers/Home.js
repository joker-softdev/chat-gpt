import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/footer/Footer';

import '../styles/layout/Home.css';

const Home = () => {
  return (
  <div className="container">
      <h1>Welcome to the Tax Genii</h1>
      <div className='center'>
        <Link to="/chat" className="back-link">
          Click to begin experience.
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
