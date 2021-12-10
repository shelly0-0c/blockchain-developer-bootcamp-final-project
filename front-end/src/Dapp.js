import React from "react";

// using ethers to interact with Ethereum network and our contract
import { ethers } from "ethers";

// all the logic of the dapp contained in the Dapp component
// all these components don't have logics, they are just presentational ones

import { ConnectWallet } from "./components/ConnectWallet";
import { NoWalletDetected } from "./components/NoWalletDetected";
import { SurveyPage } from "./pages/SurveyPage";

// this is hardhat network id, you will need to change it when deploying to
// other networks
const HARDHAT_NETWORK_ID = "31337";

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      provider: undefined,
      isWalletConnected: false,
      selectedAddress: undefined,
      networkConnected: undefined,
      balance: undefined
    };

    this.state = this.initialState;
  }

  // initialize ethers by creating a provider
  _initializeEthers() {
    this._provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  }

  componentDidMount() {
    this._initializeEthers();
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    return (
      <div className="container p-4">
        {!this.state.isWalletConnected && (
          <ConnectWallet connectWallet={() => this._connectWallet()} />
        )}
        {this.state.isWalletConnected && <SurveyPage {...this.state} />}
      </div>
    );
  }

  // when a user clicks "Connect Wallet", this method is executed
  // it connects the dapp to the user's wallet
  // retrieves wallet's balance and the network it is connected to
  async _connectWallet() {
    try {
      const accounts = await this._provider.send("eth_requestAccounts");
      const account = accounts[0];

      const signer = await this._provider.getSigner(0);

      // network default chainId is 0x539 in hex, 1337 in decimal (chainId on metamask)
      // 31337 in decimal (chainId on hardhat network)
      const network = await this._provider.send("eth_chainId");

      // retrieve the balance of the wallet
      const balance = await this._provider.getBalance(account);

      // change in state will re-render UI
      this.setState({
        selectedAddress: account,
        isWalletConnected: true,
        networkConnected: network,
        balance: ethers.utils.formatEther(balance)
      });
    } catch (err) {
      // to replace with error toast box
      console.log(err);
    }

    // reset the dapp state if the network is changed
    this._provider.on("network", (newNetwork, oldNetwork) => {
      this._resetState();
      window.location.reload();
    });
  }

  _resetState() {
    this.setState(this.initialState);
  }

  // check if metamask selected network is localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }
  }
}
