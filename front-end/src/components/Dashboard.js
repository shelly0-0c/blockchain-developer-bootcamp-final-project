import React from "react";

export function Dashboard({ selectedAddress, networkConnected, balance }) {
  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-12 text-center">
          <p>Wallet Address: {selectedAddress}</p>
          <p>Network: {networkConnected}</p>
          <p>Balance: {balance}</p>
        </div>
      </div>
    </div>
  );
}
