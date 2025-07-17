// src/pages/moderators/feedback-evaluation/Suggestions.tsx
import React from "react";
import { List, Card, Typography } from "antd";

interface Suggestion {
  id: string;
  reviewer: string;
  comment: string;
  date: string;
}

const mockSuggestions: Suggestion[] = [
  {
    id: "s1",
    reviewer: "Dr. Alice",
    comment: "Please expand on related work.",
    date: "2024-07-12",
  },
  {
    id: "s2",
    reviewer: "Mr. Bob",
    comment: "Abstract too brief, add examples.",
    date: "2024-07-14",
  },
];

export default function Suggestions() {
  return (
    <Card title="Reviewer Suggestions" size="small">
      <List
        dataSource={mockSuggestions}
        renderItem={item => (
          <List.Item>
            <Typography.Text strong>{item.reviewer}</Typography.Text> (
            {item.date}): {item.comment}
          </List.Item>
        )}
      />
    </Card>
  );
}
