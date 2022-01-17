import React from "react";

import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

export function SurveyCard({ onTakeSurvey, onCloseSurvey, info }) {
  return (
    <Card>
      <Card.Body>
        <Stack direction="horizontal">
          <Card.Title>{info.title}</Card.Title>
          <Button
            className="ms-auto"
            variant="secondary"
            onClick={(events) => onTakeSurvey(events)}
          >
            Begin Survey
          </Button>
          <Button
            className="ms-auto"
            variant="secondary"
            onClick={(events) => onCloseSurvey(events)}
          >
            Close Survey
          </Button>
        </Stack>
        <Stack direction="horizontal" gap={3}>
          <Card.Subtitle>Survey Creator: {info.survey_owner}</Card.Subtitle>
          <div className="vr" />
          <Card.Subtitle>Closing Date: {info.closingDate}</Card.Subtitle>
          <div className="vr" />
          <Card.Subtitle className="text-muted">
            Survey Length: {info.length}
          </Card.Subtitle>
        </Stack>
        <Card.Text gap={2}>{info.description}</Card.Text>
      </Card.Body>
    </Card>
  );
}
