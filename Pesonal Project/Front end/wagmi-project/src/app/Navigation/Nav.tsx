import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
    return (
        <div className="topnav">
            <Link className="active" to="/home">Home</Link>
            <Link to="/priceOracle">PriceOracle</Link>
            <Link to="/collateralManager">CollateralManager</Link>
            <Link to="/lendingPool">LendingPool</Link>
            <Link to="/borrower">Borrower</Link>
            <Link to="/interestRate">InterestRate</Link>

        </div>
    );
};

export default Nav;
