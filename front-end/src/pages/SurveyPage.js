import React, { useState, useEffect } from "react";
import { NFTStorage } from "nft.storage";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Toast from "react-bootstrap/Toast";

import surveys from "../data/sample_survey.json";

import { SurveyPopUp } from "../components/SurveyPopUp";

export function SurveyPage({ selectedAddress, networkConnected, balance }) {
  const [allValues, setAllValues] = useState({
    modalShow: false,
    data: {}
  });

  // instantiate NFT Storage client
  const client = new NFTStorage({
    token: process.env.REACT_APP_NFT_STORAGE_API_KEY
  });

  useEffect(() => {
    console.log(allValues);
  });

  // using NFT Storage client to store the text file and metadata object
  // of the survey answer text file on IPFS
  async function _store(data) {
    const fileCid = await client.storeBlob(new Blob([data]));
    const fileUrl = (await "https://ipfs.io/ipfs/") + fileCid;

    const obj = {
      title: "Survey Answer Metadata",
      type: "text",
      file_url: fileUrl
    };

    const metadata = new Blob([JSON.stringify(obj)], {
      type: "application/json"
    });
    const metadataCid = await client.storeBlob(metadata);
    const metadataUrl = "https://ipfs.io/ipfs/" + metadataCid;

    return metadataUrl;
  }

  async function _tokenizeNFT() {}

  async function _takeSurvey(events) {
    const metadataUrl = await _store(events);

    // replace with Toast later
    console.log("Stored NFT successfully!\nMetadata URL: ", metadataUrl);
  }

  function _createSurvey() {}

  return (
    <Container>
      <SurveyPopUp
        survey={allValues.data}
        onSubmit={_takeSurvey}
        onShow={allValues.modalShow}
        onHide={() => setAllValues({ ...allValues, modalShow: false })}
      ></SurveyPopUp>
      <Stack gap={4}>
        <Card>
          <Card.Body>
            <Card.Text>Wallet Address: {selectedAddress}</Card.Text>
            <Card.Text>Network: {networkConnected}</Card.Text>
            <Card.Text>Balance: {balance}</Card.Text>
          </Card.Body>
        </Card>
        <Stack direction="horizontal" gap={3}>
          <Button
            className="border ms-auto"
            variant="primary"
            onClick={_createSurvey}
          >
            Create Survey
          </Button>
          <div className="vr" />
          <Button className="border" variant="primary">
            Redeem Rewards
          </Button>
        </Stack>
        <Stack gap={1}>
          {surveys.map((data) => (
            <Card key={data.id}>
              <Card.Body>
                <Stack direction="horizontal">
                  <Card.Title>{data.title}</Card.Title>
                  <Button
                    className="ms-auto"
                    variant="secondary"
                    onClick={() => {
                      setAllValues({
                        ...allValues,
                        data: data,
                        modalShow: true
                      });
                    }}
                  >
                    Begin Survey
                  </Button>
                </Stack>
                <Stack direction="horizontal" gap={3}>
                  <Card.Subtitle>
                    Survey Creator: {data.survey_owner}
                  </Card.Subtitle>
                  <div className="vr" />
                  <Card.Subtitle>
                    Data Sensitivity: {data.data_sensitivity}
                  </Card.Subtitle>
                  <div className="vr" />
                  <Card.Subtitle className="text-muted">
                    Survey Length: {data.length}
                  </Card.Subtitle>
                </Stack>
                <Card.Text gap={2}>{data.description}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
