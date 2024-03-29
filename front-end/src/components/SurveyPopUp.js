import React, { useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export function SurveyPopUp({ address, survey, onShow, onHide, onSubmit }) {
  const [item_1, setItem1] = useState("");
  const [item_2, setItem2] = useState("");
  const [item_3, setItem3] = useState("");

  function handleSubmit() {
    const allValues = [item_1, item_2, item_3];
    const formatted = formatAnswer(allValues);

    const survey_response = {
      id: survey.id,
      title: survey.title,
      survey_taker: address,
      responses: formatted,
    };

    onHide(true);
    onSubmit(survey_response);
  }

  function formatAnswer(allValues_arr) {
    const survey_content = [];

    survey.content.forEach((value, index) => {
      const data_obj = {
        id: index + 1,
        question: value.question,
        answer: allValues_arr[index],
      };
      survey_content.push(data_obj);
    });
    return survey_content;
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
        <Modal.Title id="contained-modal-title-vcenter">
          {survey.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {survey.content && (
          <Form>
            <Form.Group
              className="mb-3"
              controlId={survey.content[0].id}
              key="1"
            >
              <Form.Label>{survey.content[0].question}</Form.Label>
              <Form.Control
                type="text"
                onChange={(event) => {
                  setItem1(event.target.value);
                }}
                required
              />
              {survey.content[0].suggestions && (
                <Form.Text className="text-muted">
                  Suggestions: {survey.content[0].suggestions}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId={survey.content[1].id}
              key="2"
            >
              <Form.Label>{survey.content[1].question}</Form.Label>
              <Form.Control
                type="text"
                onChange={(event) => {
                  setItem2(event.target.value);
                }}
                required
              />
              {survey.content[1].suggestions && (
                <Form.Text className="text-muted">
                  Suggestions: {survey.content[1].suggestions}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId={survey.content[2].id}
              key="3"
            >
              <Form.Label>{survey.content[2].question}</Form.Label>
              <Form.Control
                type="text"
                onChange={(event) => {
                  setItem3(event.target.value);
                }}
                required
              />
              {survey.content[2].suggestions && (
                <Form.Text className="text-muted">
                  Suggestions: {survey.content[2].suggestions}
                </Form.Text>
              )}
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" onClick={handleSubmit}>
          Upload & Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
