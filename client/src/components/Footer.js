import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <footer id="footer" className="w-100 mt-auto bg-secondary p-4">
      <div className="container text-center mb-5">
        {location.pathname !== '/' && (
          <button id="back" className="btn"
            onClick={() => navigate(-1)}
          >
            <i class="fa-solid fa-left-long"></i> Go Back 
          </button>
        )}
        <h4 id="foot-title">
         
          <div className="col-12 col-sm-12 col-md-8 mx-auto">
            <a
								className="px-3"
								href="https://github.com/AASports89/u-truck"
								target="_blank"
								rel="noopener noreferrer">
                                <i id="github" className="fa-brands fa-github"></i>
							</a>
              {' '}
            </div>
            <strong> AASports89 &copy; {year} </strong>
        </h4>
      </div>
    </footer>
  );
};

export default Footer;