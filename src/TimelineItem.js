import React, { useState } from 'react';
import './index.css';

function TimelineItemEditor(props) {
  const [eventName, setEventName] = useState(props.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    props.submit(eventName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />
    </form>
  );
}

function TimelineItem(props) {
  const diff = props.end.diff(props.start, 'days') + 1;
  const [isEditMode, setIsEditMode] = useState(false);

  const propogateUpdates = (name = props.name, start = props.start, end = props.end) => {
    setIsEditMode(false);
    props.handleUpdateItem(
      props.id,
      name,
      start,
      end,
    );
  };
  console.log(props.id);
  return (
    <div
      className="timeline-item"
      style={{
        left: props.offset * 117,
        width: diff * 117,
        top: props.top * 38,
        backgroundColor: colorArray[props.id % 50],
      }}
    >
      {isEditMode ? <TimelineItemEditor name={props.name} submit={propogateUpdates} />
        : <span onClick={() => setIsEditMode(!isEditMode)}>{props.name}</span>}
    </div>
  );
}

const colorArray = [
  'aqua', 'black', 'blue', 'fuchsia', 'gray', 'green',
  'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red',
  'silver', 'teal', 'yellow',
];

export default TimelineItem;
