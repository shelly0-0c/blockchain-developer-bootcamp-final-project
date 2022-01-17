import React, { useState, useEffect } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export function SurveyRefundPopUp({
  escrowAddress,
  selectedAddress,
  survey,
  onShow,
  onHide,
  onSubmit,
}) {
  function handleSubmit() {
    onHide(true);
    onSubmit(survey.id);
  }

  return (
    <Modal
      show={onShow}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Refund Details
        </Modal.Title>
      </Modal.Header>
      <Form>
        <Modal.Body>
          <Form.Group as={Row} className="mb-3" controlId="formFromAddr">
            <Form.Label column sm={2}>
              Refund By
            </Form.Label>
            <Col sm={10}>
              <Form.Text muted>{escrowAddress}</Form.Text>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formSurveyId">
            <Form.Label column sm={2}>
              Survey Id
            </Form.Label>
            <Col sm={10}>
              <Form.Text muted>{survey.id}</Form.Text>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formSurveyTitle">
            <Form.Label column sm={2}>
              Survey Title
            </Form.Label>
            <Col sm={10}>
              <Form.Text muted>{survey.title}</Form.Text>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formToAddr">
            <Form.Label column sm={2}>
              Recipient
            </Form.Label>
            <Col sm={10}>
              <Form.Text muted>{selectedAddress}</Form.Text>
            </Col>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            Withdraw Remaining
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
