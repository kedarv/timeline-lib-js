import React, { useState, useRef } from 'react';
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';
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
  name, end, start, id, offset, top, handleUpdateItem, scrollPos
}) {
  const diff = end.diff(start, 'days') + 1;
  const [isEditMode, setIsEditMode] = useState(false);
  const itemRef = useRef(null);

  const propogateUpdates = (updateName = name, updateStart = start, updateEnd = end) => {
    setIsEditMode(false);
    handleUpdateItem(
      id,
      updateName,
      updateStart,
      updateEnd,
    );
  };

  const handleOnResize = (e) => {
    e.preventDefault();
    e.persist();
    const width = itemRef.current.clientWidth;
    const x = itemRef.current.getBoundingClientRect().left;
    let mutated = false;
    onmousemove = (event) => {
      if (e.target.dataset.direction === "right") {
        let computedWidth = width + (event.pageX - e.pageX);

        // Make sure we don't go less than one day
        if (computedWidth > 117) {
          itemRef.current.style.width = computedWidth + 'px';
          mutated = true;
        }
      } else if (e.target.dataset.direction === "left") {
        const computedWidth = width - (event.pageX - e.pageX);
        if (computedWidth > 117) {
          itemRef.current.style.width = computedWidth + 'px';
          itemRef.current.style.left = scrollPos + x + (event.pageX - e.pageX) - 22 + 'px';
          mutated = true;
        }
      }
    }
    onmouseup = () => {
      if (mutated) {
        if (e.target.dataset.direction === "right") {
          itemRef.current.style.width = Math.round(itemRef.current.clientWidth / 117) * 117 + 'px';
        } else if (e.target.dataset.direction === "left") {
          itemRef.current.style.width = Math.round(itemRef.current.clientWidth / 117) * 117 + 'px';
          const rounded = Math.round((event.pageX - e.pageX) / 117) * 117
          itemRef.current.style.left = scrollPos + x + rounded - 22 + 'px';
        }
        mutated = false;
      }
      onmousemove = null;
    }
  }

  return (

    <div
      className="timeline-item"
      ref={itemRef}
      style={{
        left: offset * 117,
        width: diff * 117,
        top: top * 38,
        backgroundColor: colorArray[id % colorArray.length],
      }}
    >
      <div class='resize-right' data-direction={"right"} onMouseDown={handleOnResize}></div>
      <div class='resize-left' data-direction={"left"} onMouseDown={handleOnResize}></div>

      {isEditMode ? <TimelineItemEditor name={name} submit={propogateUpdates} />
        : <span onClick={() => setIsEditMode(!isEditMode)}>{name}</span>}
    </div>
  );
}

export default TimelineItem;
