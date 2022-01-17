import React, { useState } from "react";

import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

export function Notification({ isError = false, messageObj, show, onHide }) {
  function handleClose() {
    onHide(true);
  }

  return (
    <ToastContainer position="top-end">
      <Toast
        onClose={() => handleClose()}
        show={show}
        bg={isError ? "danger" : "light"}
        delay={8000}
        autohide
      >
        <Toast.Header>
          {isError && <strong className="me-auto">Transaction Error</strong>}
          {!isError && <strong className="me-auto">Transaction</strong>}
        </Toast.Header>
        {isError && (
          <Toast.Body className={"text-white"}>{messageObj.message}</Toast.Body>
        )}
        {!isError && (
          <Toast.Body className={"text-black"}>{messageObj}</Toast.Body>
        )}
      </Toast>
    </ToastContainer>
  );
}
