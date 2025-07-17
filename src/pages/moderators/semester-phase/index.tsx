import React from "react";
import Phases from "./Phases";
import Rounds from "./Rounds";
import SemesterList from "./SemesterList";

export default function SemesterPhasePage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Semester & Phase Management</h2>
      <SemesterList />
      <Phases />
      <Rounds />
    </div>
  );
}
