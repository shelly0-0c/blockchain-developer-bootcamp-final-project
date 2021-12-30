import React, { useState, useEffect } from "react";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Toast from "react-bootstrap/Toast";

import { SurveyPopUp } from "../components/SurveyPopUp";
import { SurveyCreationPopUp } from "../components/SurveyCreationPopUp";

export function SurveyPage({
  surveys,
  selectedAddress,
  networkConnected,
  balance,
  onCreateSurvey,
  onBeginSurvey,
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

  // Survey List to display
  const [surveyList, setSurveyList] = useState([]);

  // to populate surveys when surveys reference changed
  useEffect(() => {
    setSurveyList(surveys);
  }, [surveys]);

  // Taking Survey
  async function _takeSurvey(events) {
    onBeginSurvey(events);
  }

  // Survey Creation:
  // update surveylist state and refresh display of survey page
  // Note: HARDCODED Data to be removed!!!
  function _createSurvey(events) {
    console.log("survey created");

    onCreateSurvey({
      title: "abcd",
      length: "efgh",
      description: "ijkl",
      survey_owner: "mno",
      closing_date: "1640672139",
      total_rewards_eth: "1",
      reward_eth: "0.00001",
      id: "64bac1-eec-d08f-cf5-00e526c1a0b8",
      content: [
        {
          question: "how are you?",
          suggestion: "well, okay, bad",
        },
        {
          question: "hello?",
          suggestion: "",
        },
        {
          question: "pqrz",
          suggestion: "",
        },
      ],
    });
  }

  return (
    <Container>
      <SurveyPopUp
        survey={selectedValues.data}
        onSubmit={_takeSurvey}
        onShow={selectedValues.modalShow}
        onHide={() =>
          setSelectedValues({ ...selectedValues, modalShow: false })
        }
      ></SurveyPopUp>
      <SurveyCreationPopUp
        survey={newSurvey.data}
        onSubmit={_createSurvey}
        onShow={newSurvey.modalShow}
        onHide={() => setNewSurvey({ ...newSurvey, modalShow: false })}
      ></SurveyCreationPopUp>
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
            // onClick={() => {
            //   setNewSurvey({
            //     ...newSurvey,
            //     modalShow: true,
            //   });
            // }}
            onClick={() => {
              _createSurvey();
            }}
          >
            Create Survey
          </Button>
          <div className="vr" />
          <Button className="border" variant="primary">
            Redeem Rewards
          </Button>
        </Stack>
        <Stack gap={1}>
          {surveyList.map((data) => (
            <Card key={data.id}>
              <Card.Body>
                <Stack direction="horizontal">
                  <Card.Title>{data.title}</Card.Title>
                  <Button
                    className="ms-auto"
                    variant="secondary"
                    onClick={() => {
                      setSelectedValues({
                        ...selectedValues,
                        data: data,
                        modalShow: true,
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
