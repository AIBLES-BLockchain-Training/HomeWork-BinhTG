'use client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Nav from "./Navigation/Nav";
import Home from "./Navigation/Home";
import PriceOracle from "./PriceOracle/PriceOracle";
import CollateralManager from './CollateralManager/CollateralManager';
import LendingPool from './LendingPool/LendingPool';
import Borrower from './Borrower/Borrower';
import InterestRate from './InterestRate/InterestRate';

import '../app/page.css'
function App() {
  

  return (
    <Router>
        <Nav />
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/priceOracle" element={<PriceOracle />} />
            <Route path="/collateralManager" element={<CollateralManager />} />
            <Route path="/lendingPool" element={<LendingPool />} />
            <Route path="/borrower" element={<Borrower />} />
            <Route path="/interestRate" element={<InterestRate />} />

          </Routes>
      </Router>
  )
}

export default App
