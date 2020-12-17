import React, { useState } from 'react';
import './index.css';

const colorArray = [
  '#001f3f', '#0074D9', '#39CCCC', '#3D9970', '#2ECC40', '#FF851B',
  '#FF4136', '#85144b', '#F012BE', '#B10DC9', '#AAAAAA',
];

function TimelineItemEditor({ name, submit }) {
  const [eventName, setEventName] = useState(name);

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(eventName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        autoFocus
        type="text"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        onBlur={() => submit(eventName)}
      />
    </form>
  );
}

function TimelineItem({
  name, end, start, id, offset, top, handleUpdateItem,
}) {
  const diff = end.diff(start, 'days') + 1;
  const [isEditMode, setIsEditMode] = useState(false);

  const propogateUpdates = (updateName = name, updateStart = start, updateEnd = end) => {
    setIsEditMode(false);
    handleUpdateItem(
      id,
      updateName,
      updateStart,
      updateEnd,
    );
  };

  return (
    <div
      className="timeline-item"
      style={{
        left: offset * 117,
        width: diff * 117,
        top: top * 38,
        backgroundColor: colorArray[id % colorArray.length],
      }}
    >
      {isEditMode ? <TimelineItemEditor name={name} submit={propogateUpdates} />
        : <span onClick={() => setIsEditMode(!isEditMode)}>{name}</span>}
    </div>
  );
}

export default TimelineItem;
