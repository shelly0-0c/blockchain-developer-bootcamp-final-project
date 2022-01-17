import React from "react";

import { NFTStorage } from "nft.storage";

// using ethers to interact with Ethereum network and our contract
import { ethers } from "ethers";

import SurveyProcessorArtifact from "./contracts/SurveyProcessor.json";
import RewardEscrowArtifact from "./contracts/RewardEscrow.json";

import SAMPLE_SURVEYS from "./data/sample_surveys.json";

// all the logic of the dapp contained in the Dapp component
// all these components don't have logics, they are just presentational ones

import { Notification } from "./components/Notification";
import { ConnectWallet } from "./components/ConnectWallet";
import { NoWalletDetected } from "./components/NoWalletDetected";
import { SurveyPage } from "./pages/SurveyPage";
import { LoadingScreen } from "./components/LoadingScreen";

// this is ropsten network id, you will need to change it when deploying to
// other networks
const ROPSTEN_NETWORK_ID = "3";

const ETHEREUM_NETWORK = {
  "0x539": "Ganache",
  "0x3": "Ropsten",
  "0x4": "Rinkeby",
};

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      loading: {
        isBtnDisabled: true,
        status: false,
        message: undefined,
      },
      isWalletConnected: false,
      escrowAddress: undefined,
      selectedAddress: undefined,
      balance: undefined,
      network: {
        name: undefined,
        error: undefined,
        showError: false,
        showInfo: false,
      },
      tx: {
        info: undefined,
        error: undefined,
        showError: false,
        showInfo: false,
      },
      ipfs: {
        info: undefined,
        error: undefined,
        showError: false,
        showInfo: false,
      },
      surveys: [],
      responses: {},
    };

    this.state = this.initialState;
  }

  // initialize ethers by creating a provider
  _initializeEthers() {
    this._provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    // instantiate Survey Processor Contract
    this._surveyContract = new ethers.Contract(
      process.env.REACT_APP_SURVEY_PROCESSOR_CONTRACT,
      SurveyProcessorArtifact.abi,
      this._provider.getSigner(0)
    );

    // instantiate Reward Escrow Contract
    this._rewardEscrowContract = new ethers.Contract(
      process.env.REACT_APP_REWARD_ESCROW_CONTRACT,
      RewardEscrowArtifact.abi,
      this._provider.getSigner(0)
    );

    this.setState({
      escrowAddress: this._rewardEscrowContract.address,
    });
  }

  // initialize survey data to be populated
  _initializeData() {
    this.setState({ surveys: SAMPLE_SURVEYS });
  }

  _initializeNFTStorageClient() {
    this._NFTclient = new NFTStorage({
      token: process.env.REACT_APP_NFT_STORAGE_API_KEY,
    });
  }

  componentDidMount() {
    this._initializeEthers();
    // this._initializeData();
    this._initializeNFTStorageClient();
  }

  async componentDidUpdate(prevProps, prevState) {
    // to detect metamask account change and update state
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts[0] != prevState.selectedAddress) {
        this._getAccountBalance(accounts[0]).then((newBalance) => {
          this.setState({
            balance: ethers.utils.formatEther(newBalance),
            selectedAddress: accounts[0],
          });
        });
      }
    });

    // to detect metamask network change and update state
    window.ethereum.on("chainChanged", (chainId) => {
      if (chainId != prevState.network.name) {
        this._getMetamaskAccount().then((addr) => {
          this._getAccountBalance(addr).then((newBalance) => {
            this.setState({
              balance: ethers.utils.formatEther(newBalance),
              network: {
                ...prevState.network,
                name: ETHEREUM_NETWORK[chainId],
              },
            });
          });
        });
      }
    });

    // event listeners when contract transactions are executed
    // in ethers.js v5, when events are scanned during component load, they will get fired although no event actually happens
    // which is why the event listeners are wrapped inside _provider.once to prevent that scenario
    // in ethere.js v6, this issue is resolved
    // ref: https://github.com/ethers-io/ethers.js/issues/2310
    this._provider.once("block", () => {
      this._surveyContract.on(
        "LogSurveyRegistered",
        (surveyCreator, surveyId) => {
          this.setState((prevState) => ({
            ...prevState,
            tx: {
              info: `New Survey ID:\n ${surveyId}\n is registered for \n${surveyCreator}`,
              showInfo: true,
            },
          }));
        }
      );

      this._surveyContract.on(
        "LogSurveyResponseSubmitted",
        (respondent, surveyId, totalResponses) => {
          this.setState((prevState) => ({
            ...prevState,
            responses: {
              ...prevState.responses,
              [`${surveyId}`]: parseInt(totalResponses),
            },
            loading: {
              ...prevState.loading,
              isBtnDisabled: false,
            },
          }));
        }
      );

      this._surveyContract.on(
        "LogSurveyResponseExists",
        (respondent, surveyId) => {
          this.setState((prevState) => ({
            ...prevState,
            tx: {
              info: `This address has already taken the survey`,
              showInfo: true,
            },
          }));
        }
      );
    });

    this._rewardEscrowContract.on(
      "LogReturnRemainingCredit",
      (surveyId, recipient) => {
        this.setState((prevState) => ({
          ...prevState,
          tx: {
            info: `Remaining ETH esrowed from ${surveyId} returned to ${recipient}`,
            showInfo: true,
          },
        }));
      }
    );

    this._surveyContract.on("LogSurveyRemoved", (surveyOwner, surveyId) => {
      this.setState((prevState) => ({
        ...prevState,
        tx: {
          info: `Survey with ID: ${surveyId} owned by ${surveyOwner} is removed`,
          showInfo: true,
        },
        loading: {
          status: false,
        },
      }));
    });
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    return (
      <div className="container p-4">
        {!this.state.isWalletConnected && (
          <div className="container vertical-center">
            <h2 className="text-white text-center">
              <strong>Survey DApp</strong>
            </h2>
            <p className="text-white text-center">
              Get ETH for answering surveys
            </p>
            <ConnectWallet connectWallet={() => this._connectWallet()} />
          </div>
        )}
        {this.state.isWalletConnected && (
          <SurveyPage
            {...this.state}
            onCreateSurvey={(data) => this._registerSurvey(data)}
            onTakeSurvey={(data) => this._takeSurvey(data)}
            onRefund={(data) => this._refundCredits(data)}
          />
        )}
        {this.state.tx.showError && (
          <Notification
            isError={true}
            messageObj={this.state.tx.error}
            show={this.state.tx.showError}
            onHide={(data) => this._closeTxError(data)}
          />
        )}
        {this.state.network.showError && (
          <Notification
            isError={true}
            messageObj={this.state.network.error}
            show={this.state.network.showError}
            onHide={(data) => this._closeNetworkError(data)}
          />
        )}
        {this.state.network.showInfo && (
          <Notification
            isError={false}
            messageObj={this.state.network.info}
            show={this.state.network.showInfo}
            onHide={(data) => this._closeInfo(data)}
          />
        )}
        {this.state.tx.showInfo && (
          <Notification
            isError={false}
            messageObj={this.state.tx.info}
            show={this.state.tx.showInfo}
            onHide={(data) => this._closeInfo(data)}
          />
        )}
        {this.state.loading.status && (
          <LoadingScreen
            onShow={this.state.loading.status}
            isBtnDisabled={this.state.loading.isBtnDisabled}
            onHide={(data) => this._loadingCloseHandler(data)}
            message={this.state.loading.message}
          />
        )}
      </div>
    );
  }

  async _getMetamaskAccount() {
    const accounts = await this._provider.send("eth_requestAccounts");
    return accounts[0];
  }

  async _getNetworkConnected() {
    return this._provider.send("eth_chainId");
  }

  async _getAccountBalance(account) {
    return this._provider.getBalance(account);
  }

  // when a user clicks "Connect Wallet", this method is executed
  // it connects the dapp to the user's wallet
  // retrieves wallet's address, balance and the network it is connected to
  async _connectWallet() {
    try {
      const account = await this._getMetamaskAccount();
      const chainId = await this._getNetworkConnected();

      // retrieve the balance of the wallet
      const balance = await this._getAccountBalance(account);

      // change in state will re-render UI
      this.setState({
        selectedAddress: account,
        isWalletConnected: true,
        network: {
          name: ETHEREUM_NETWORK[chainId],
        },
        balance: ethers.utils.formatEther(balance), // format from WEI to ETH
      });
    } catch (err) {
      this.setState((prevState) => ({
        ...prevState,
        network: {
          error: err,
          showError: true,
        },
      }));
    }
  }

  // callback function when Create Survey button is clicked
  async _registerSurvey(newSurvey) {
    const decimalPlaces = 18;
    try {
      // override parameters in contract call, sending ETH to payable function

      const overrides = {
        value: ethers.utils.parseEther(newSurvey.total_rewards_eth),
      };

      // contract method call
      const transaction = await this._surveyContract.registerSurvey(
        newSurvey.id,
        ethers.utils.parseUnits(newSurvey.total_rewards_eth, decimalPlaces),
        ethers.utils.parseUnits(newSurvey.reward_eth, decimalPlaces),
        newSurvey.closing_date,
        overrides
      );

      // using .wait() to wait for the transaction to be mined.
      const receipt = await transaction.wait();

      const latestBalance = await this._getAccountBalance(
        this.state.selectedAddress
      );

      // status flag = 1 means successful transaction, update list of surveys on display
      if (receipt.status) {
        this.setState((prevState) => ({
          ...prevState, // copy all other fields
          balance: ethers.utils.formatEther(latestBalance),
          loading: {
            status: false,
          },
          surveys: [
            ...prevState.surveys, // recreate the array that contains surveys
            newSurvey, // add the new survey to the array
          ],
        }));
      }
    } catch (error) {
      const latestBalance = await this._getAccountBalance(
        this.state.selectedAddress
      );
      this.setState((prevState) => ({
        ...prevState,
        loading: {
          status: false,
        },
        balance: ethers.utils.formatEther(latestBalance),
        tx: {
          error: error,
          showError: true,
        },
      }));
    }
  }

  // callback function when Take Survey is clicked
  async _takeSurvey(surveyResponse) {
    try {
      // store survey response metadata and survey response in ipfs

      this.setState((prevState) => ({
        ...prevState,
        loading: {
          status: true,
          message: "",
        },
      }));

      const metadataUrl = await this._store(surveyResponse);

      const transaction = await this._surveyContract.answerSurvey(
        surveyResponse.id,
        metadataUrl
      );

      const receipt = await transaction.wait();

      const latestBalance = await this._getAccountBalance(
        this.state.selectedAddress
      );

      if (receipt.status) {
        this.setState((prevState) => ({
          ...prevState,
          balance: ethers.utils.formatEther(latestBalance),
          ipfs: {
            showInfo: true,
            info: `Uploaded to IPFS Metadata URL:\n ${metadataUrl}`,
          },
          loading: {
            status: true,
            message: `Uploaded to IPFS Metadata URL:\n ${metadataUrl}`,
          },
        }));
      }
    } catch (error) {
      // need to catch error and if survey is already answered by user

      const latestBalance = await this._getAccountBalance(
        this.state.selectedAddress
      );

      this.setState((prevState) => ({
        ...prevState,
        balance: ethers.utils.formatEther(latestBalance),
        tx: {
          error: error,
          showError: true,
        },
        loading: {
          status: false,
        },
      }));
    }
  }

  // callback function remaining amount is returned to survey owner
  // when survey is closed
  async _refundCredits(surveyId) {
    try {
      // contract method call
      const transaction = await this._surveyContract.refundOnSurveyClosed(
        surveyId
      );

      this.setState((prevState) => ({
        ...prevState,
        loading: {
          status: true,
          message: "",
        },
      }));

      const receipt = await transaction.wait();

      const latestBalance = await this._getAccountBalance(
        this.state.selectedAddress
      );

      if (receipt.status) {
        this.setState((prevState) => ({
          ...prevState,
          balance: ethers.utils.formatEther(latestBalance),
          surveys: prevState.surveys.filter((each) => each.id != surveyId),
        }));
      }
    } catch (error) {
      const latestBalance = await this._getAccountBalance(
        this.state.selectedAddress
      );

      this.setState((prevState) => ({
        ...prevState,
        balance: ethers.utils.formatEther(latestBalance),
        loading: {
          status: false,
        },
        tx: {
          error: error,
          showError: true,
        },
      }));
    }
  }

  // Taking Survey:
  // using NFT Storage client to store survey response and metadata object of the survey response text on IPFS
  // Note that storing survey responses on IPFS is not a good architectual design (need response data to be private), but
  // to complete the E2E user flow
  async _store(data) {
    try {
      const fileCid = await this._NFTclient.storeBlob(
        new Blob([JSON.stringify(data.responses)])
      );
      const fileUrl = (await "https://ipfs.io/ipfs/") + fileCid;

      const obj = {
        id: data.id,
        title: data.title + " metadata",
        type: "text",
        survey_taker: data.survey_taker,
        file_url: fileUrl,
      };

      const metadata = new Blob([JSON.stringify(obj)], {
        type: "application/json",
      });
      const metadataCid = await this._NFTclient.storeBlob(metadata);
      const metadataUrl = "https://ipfs.io/ipfs/" + metadataCid;
      return metadataUrl;
    } catch (error) {
      this.setState((prevState) => ({
        ...prevState,
        ipfs: {
          error: error,
          showError: true,
        },
      }));
    }
  }

  async _loadingCloseHandler(onShow) {
    if (!onShow) {
      this.setState((prevState) => ({
        ...prevState,
        loading: { status: false },
      }));
    }
  }

  async _closeTxError(onClose) {
    if (onClose) {
      this.setState((prevState) => ({
        ...prevState,
        tx: {
          showError: false,
        },
      }));
    }
  }

  async _closeInfo(onClose) {
    if (onClose) {
      this.setState((prevState) => ({
        ...prevState,
        tx: {
          ...prevState.tx,
          showInfo: false,
        },
        network: {
          ...prevState.network,
          showInfo: false,
        },
        ipfs: {
          ...prevState.ipfs,
          showInfo: false,
        },
      }));
    }
  }

  async _closeNetworkError(onClose) {
    if (onClose) {
      this.setState((prevState) => ({
        ...prevState,
        network: {
          showError: false,
        },
      }));
    }
  }

  _resetState() {
    this.setState(this.initialState);
  }

  // check if metamask selected network is localhost:7545
  // _checkNetwork() {
  //   if (window.ethereum.networkVersion === ROPSTEN_NETWORK_ID) {
  //     return true;
  //   }

  //   this.setState((prevState) => ({
  //     ...prevState,
  //     network: {
  //       error: "Please connect Metamask to Ropsten Network",
  //       showError: true,
  //     },
  //   }));
  // }
}
