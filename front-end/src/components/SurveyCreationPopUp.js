import React, { useState, useRef } from "react";

import uuid from "react-uuid";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";

export function SurveyCreationPopUp({ onShow, onHide, onSubmit }) {
  const myRefs = useRef([]);

  const [metadata, setMetadata] = useState({
    title: "",
    length: "",
    description: "",
    survey_owner: "",
    closing_date: "",
    total_rewards_eth: "",
    reward_eth: "",
  });

  const [question_1, setQuestion1] = useState({
    question: "",
    suggestion: "",
  });
  const [question_2, setQuestion2] = useState({
    question: "",
    suggestion: "",
  });
  const [question_3, setQuestion3] = useState({
    question: "",
    suggestion: "",
  });

  function handleSubmit() {
    const formatted = formatAnswer();
    onHide(true);
    onSubmit(formatted);
  }

  function formatAnswer() {
    const id = uuid();
    const allQuestions = [question_1, question_2, question_3];
    const data_obj = {
      ...metadata,
      id: id,
      content: allQuestions,
    };
    return data_obj;
  }

  function handleKeyEnter(e, targetElem) {
    if (e.key === "Enter" && targetElem) {
      targetElem.focus();
    }
  }

  return (
    <Modal
      show={onShow}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">New Survey</Modal.Title>
      </Modal.Header>
      <Form>
        <Modal.Body>
          <Form.Group as={Row} className="mb-3" controlId="formSurveyTitle">
            <Form.Label column sm={2}>
              Survey Title
              <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                required
                onChange={(event) => {
                  setMetadata((prevState) => {
                    return { ...prevState, title: event.target.value };
                  });
                }}
                onKeyPress={(e) => {
                  handleKeyEnter(e, myRefs.current[2]);
                }}
                ref={(el) => (myRefs.current[1] = el)}
                key="1"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formSurveyLength">
            <Form.Label column sm={2}>
              Survey Length
              <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                required
                onChange={(event) => {
                  setMetadata((prevState) => {
                    return { ...prevState, length: event.target.value };
                  });
                }}
                onKeyPress={(e) => handleKeyEnter(e, myRefs.current[3])}
                ref={(el) => (myRefs.current[2] = el)}
                key="2"
              />
            </Col>
          </Form.Group>
          <Form.Group
            as={Row}
            className="mb-3"
            controlId="formSurveyDescription"
          >
            <Form.Label column sm={2}>
              Survey Description
              <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                required
                onChange={(event) => {
                  setMetadata((prevState) => {
                    return { ...prevState, description: event.target.value };
                  });
                }}
                onKeyPress={(e) => handleKeyEnter(e, myRefs.current[4])}
                ref={(el) => (myRefs.current[3] = el)}
                key="3"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formSurveyOwner">
            <Form.Label column sm={2}>
              Survey Owner
              <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                required
                onChange={(event) => {
                  setMetadata((prevState) => {
                    return { ...prevState, survey_owner: event.target.value };
                  });
                }}
                onKeyPress={(e) => handleKeyEnter(e, myRefs.current[5])}
                ref={(el) => (myRefs.current[4] = el)}
                key="4"
              />
            </Col>
          </Form.Group>
          <fieldset>
            <Form.Group as={Row} className="mb-3" controlId="formSurveyFirstQ">
              <Form.Label column sm={2}>
                Survey Question 1
              </Form.Label>
              <Col sm={10}>
                <FloatingLabel label="Question*">
                  <Form.Control
                    type="text"
                    required
                    onChange={(event) => {
                      setQuestion1((prevState) => {
                        return { ...prevState, question: event.target.value };
                      });
                    }}
                    onKeyPress={(e) => handleKeyEnter(e, myRefs.current[6])}
                    ref={(el) => (myRefs.current[5] = el)}
                    key="5"
                  />
                </FloatingLabel>
                <FloatingLabel label="Suggested Response if any">
                  <Form.Control
                    type="text"
                    placeholder="Suggested Response if any"
                    onChange={(event) => {
                      setQuestion1((prevState) => {
                        return { ...prevState, suggestion: event.target.value };
                      });
                    }}
                    onKeyPress={(e) => handleKeyEnter(e, myRefs.current[7])}
                    ref={(el) => (myRefs.current[6] = el)}
                    key="6"
                  />
                </FloatingLabel>
              </Col>
            </Form.Group>
          </fieldset>
          <fieldset>
            <Form.Group as={Row} className="mb-3" controlId="formSurveySecondQ">
              <Form.Label column sm={2}>
                Survey Question 2
              </Form.Label>
              <Col sm={10}>
                <FloatingLabel label="Question*">
                  <Form.Control
                    type="text"
                    required
                    onChange={(event) => {
                      setQuestion2((prevState) => {
                        return { ...prevState, question: event.target.value };
                      });
                    }}
                    onKeyPress={(e) => handleKeyEnter(e, myRefs.current[8])}
                    ref={(el) => (myRefs.current[7] = el)}
                    key="7"
                  />
                </FloatingLabel>
                <FloatingLabel label="Suggested Response if any">
                  <Form.Control
                    type="text"
                    placeholder="Suggested Response if any"
                    onChange={(event) => {
                      setQuestion2((prevState) => {
                        return { ...prevState, suggestion: event.target.value };
                      });
                    }}
                    onKeyPress={(e) => handleKeyEnter(e, myRefs.current[9])}
                    ref={(el) => (myRefs.current[8] = el)}
                    key="8"
                  />
                </FloatingLabel>
              </Col>
            </Form.Group>
          </fieldset>
          <fieldset>
            <Form.Group as={Row} className="mb-3" controlId="formSurveyThirdQ">
              <Form.Label column sm={2}>
                Survey Question 3
              </Form.Label>
              <Col sm={10}>
                <FloatingLabel label="Question*">
                  <Form.Control
                    type="text"
                    required
                    onChange={(event) => {
                      setQuestion3((prevState) => {
                        return { ...prevState, question: event.target.value };
                      });
                    }}
                    onKeyPress={(e) => handleKeyEnter(e, myRefs.current[10])}
                    ref={(el) => (myRefs.current[9] = el)}
                    key="9"
                  />
                </FloatingLabel>
                <FloatingLabel label="Suggested Response if any">
                  <Form.Control
                    type="text"
                    placeholder="Suggested Response if any"
                    onChange={(event) => {
                      setQuestion3((prevState) => {
                        return { ...prevState, suggestion: event.target.value };
                      });
                    }}
                    onKeyPress={(e) => handleKeyEnter(e, myRefs.current[11])}
                    ref={(el) => (myRefs.current[10] = el)}
                    key="10"
                  />
                </FloatingLabel>
              </Col>
            </Form.Group>
          </fieldset>
          <hr />
          <Form.Group as={Row} className="mb-3" controlId="formClosingDate">
            <Form.Label column sm={2}>
              Closing Date
              <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                required
                onChange={(event) => {
                  setMetadata((prevState) => {
                    return { ...prevState, closing_date: event.target.value };
                  });
                }}
                onKeyPress={(e) => handleKeyEnter(e, myRefs.current[12])}
                ref={(el) => (myRefs.current[11] = el)}
                key="11"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formTotalRewards">
            <Form.Label column sm={2}>
              Total Rewards (ETH)
              <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                required
                onChange={(event) => {
                  setMetadata((prevState) => {
                    return {
                      ...prevState,
                      total_rewards_eth: event.target.value,
                    };
                  });
                }}
                onKeyPress={(e) => handleKeyEnter(e, myRefs.current[13])}
                ref={(el) => (myRefs.current[12] = el)}
                key="12"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formReward">
            <Form.Label column sm={2}>
              Reward per Response (ETH)
              <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                required
                onChange={(event) => {
                  setMetadata((prevState) => {
                    return { ...prevState, reward_eth: event.target.value };
                  });
                }}
                onKeyPress={(e) => (e.key === "Enter" ? handleSubmit() : null)}
                ref={(el) => (myRefs.current[13] = el)}
                key="13"
              />
            </Col>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
