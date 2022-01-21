import React, { useState, useEffect } from "react";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Toast from "react-bootstrap/Toast";

import { SurveyPopUp } from "../components/SurveyPopUp";
import { SurveyCreationPopUp } from "../components/SurveyCreationPopUp";
import { SurveyRefundPopUp } from "../components/SurveyRefundPopUp";

export function SurveyPage({
  surveys,
  escrowAddress,
  selectedAddress,
  network,
  balance,
  onCreateSurvey,
  onTakeSurvey,
  onRefund,
}) {
  // Taking Survey: identify which survey is selected
  const [selectedValues, setSelectedValues] = useState({
    modalShow: false,
    data: {},
  });

  // Survey Creation: for new survey
  const [newSurvey, setNewSurvey] = useState({
    modalShow: false,
    data: {},
  });

  // Closing Survey
  const [refundValues, setRefundValues] = useState({
    modalShow: false,
    data: {},
  });

  // Survey List to display
  const [surveyList, setSurveyList] = useState([]);

  // to populate surveys when surveys reference changed
  useEffect(() => {
    setSurveyList(surveys);
  }, [surveys]);

  // Taking Survey
  async function _takeSurvey(events) {
    onTakeSurvey(events);
  }

  // Survey Creation:
  // update surveylist state and refresh display of survey page
  function _createSurvey(events) {
    onCreateSurvey(events);
  }

  function _getRefund(events) {
    console.log("Refund remaining credits to survey owner");

    onRefund(events);
  }

  return (
    <Container>
      <SurveyPopUp
        address={selectedAddress}
        survey={selectedValues.data}
        onSubmit={_takeSurvey}
        onShow={selectedValues.modalShow}
        onHide={() =>
          setSelectedValues({ ...selectedValues, modalShow: false })
        }
      ></SurveyPopUp>
      <SurveyCreationPopUp
        address={selectedAddress}
        survey={newSurvey.data}
        onSubmit={_createSurvey}
        onShow={newSurvey.modalShow}
        onHide={() => setNewSurvey({ ...newSurvey, modalShow: false })}
      ></SurveyCreationPopUp>
      <SurveyRefundPopUp
        escrowAddress={escrowAddress}
        selectedAddress={selectedAddress}
        survey={refundValues.data}
        onShow={refundValues.modalShow}
        onHide={() => setRefundValues({ ...refundValues, modalShow: false })}
        onSubmit={_getRefund}
      ></SurveyRefundPopUp>
      <Stack gap={4}>
        <Card>
          <Card.Body>
            <Card.Text>Wallet Address: {selectedAddress}</Card.Text>
            <Card.Text>
              Network:{" "}
              {network.name == undefined ? "Unsupported" : network.name}
            </Card.Text>
            <Card.Text>Balance: {balance}</Card.Text>
          </Card.Body>
        </Card>
        <Stack direction="horizontal" gap={3}>
          <Button
            className="border ms-auto"
            variant="primary"
            onClick={() => {
              setNewSurvey({
                ...newSurvey,
                modalShow: true,
              });
            }}
            // onClick={() => {
            //   _createSurvey();
            // }}
          >
            Create Survey
          </Button>
          <div className="vr" />
          <Button className="border" variant="primary" disabled>
            Redeem Rewards (Coming Soon)
          </Button>
        </Stack>
        <Stack gap={1}>
          {surveyList.map((data) => (
            <Card key={data.id}>
              <Card.Body>
                <Stack direction="horizontal" gap={3}>
                  <Card.Title>{data.title}</Card.Title>
                  <Button
                    className="border ms-auto"
                    variant="secondary"
                    onClick={() => {
                      setSelectedValues({
                        ...selectedValues,
                        data: data,
                        modalShow: true,
                      });
                    }}
                  >
                    Take Survey
                  </Button>
                  <Button
                    className="border"
                    variant="secondary"
                    onClick={() => {
                      setRefundValues({
                        ...refundValues,
                        data: data,
                        modalShow: true,
                      });
                    }}
                  >
                    Withdraw Funds
                  </Button>
                </Stack>
                <Stack direction="horizontal" gap={3}>
                  <Card.Subtitle>
                    Survey Owner: {data.survey_owner}
                  </Card.Subtitle>
                  <div className="vr" />
                  <Card.Subtitle>
                    Closing Date: {data.closing_date}
                  </Card.Subtitle>
                  <div className="vr" />
                  <Card.Subtitle className="text-muted">
                    Survey Length: {data.length}
                  </Card.Subtitle>
                  <Button
                    className="border ms-auto"
                    variant="secondary"
                    disabled
                  >
                    Extract Responses (Coming Soon)
                  </Button>
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
