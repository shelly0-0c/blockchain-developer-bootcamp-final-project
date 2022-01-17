import React, { useState } from "react";

import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

export function LoadingScreen({
  isBtnDisabled = true,
  onShow,
  onHide,
  message,
}) {
  const [hide, setHide] = useState(false);

  function handleClose() {
    setHide(true);
    onHide(false);
  }

  return (
    <Modal
      show={onShow}
      onHide={hide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body>
        {isBtnDisabled && (
          <Row className="justify-content-md-center">
            <Spinner animation="border" role="status"></Spinner>
            <span className="text-center">Processing...</span>
          </Row>
        )}
        <Row>{message}</Row>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          variant="primary"
          type="submit"
          onClick={handleClose}
          disabled={isBtnDisabled}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
