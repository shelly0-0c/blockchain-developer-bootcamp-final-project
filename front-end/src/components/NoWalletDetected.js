import React from "react";

export function NoWalletDetected() {
  return (
    <div className="container">
      <p>
        No Ethereum wallet was detected. <br />
        Please install{" "}
        <a href="http://metamask.io" target="_blank" rel="noopener noreferrer">
          MetaMask
        </a>
        .
      </p>
    </div>
  );
}
