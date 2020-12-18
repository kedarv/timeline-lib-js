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

const ITEM_WIDTH = 117;
const ITEM_HEIGHT = 38;

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
  name, end, start, id, offset, top, handleUpdateItem, getParentRef
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const itemRef = useRef(null);
  const diff = end.diff(start, 'days') + 1;

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

    // width and x coord at the time of beginning resize
    const width = itemRef.current.clientWidth;
    const x = itemRef.current.getBoundingClientRect().left;
    let mutated = false;

    onmousemove = (event) => {
      if (e.target.dataset.direction === "right") {
        // New width is old width + current x position - old x position
        let computedWidth = width + (event.pageX - e.pageX);

        // Make sure we don't go less than one day
        if (computedWidth > ITEM_WIDTH) {
          // Set item width
          itemRef.current.style.width = computedWidth + 'px';
          mutated = true;
        }
      } else if (e.target.dataset.direction === "left") {
        // New width is old width - current x position - old x position
        // TODO: ....
        const computedWidth = width - (event.pageX - e.pageX);
        if (computedWidth > ITEM_WIDTH) {
          // Set item width
          itemRef.current.style.width = computedWidth + 'px';

          // Snap left to....
          const scrollPos = getParentRef().current.scrollLeft;
          itemRef.current.style.left = scrollPos + x + (event.pageX - e.pageX) - 22 + 'px';
          mutated = true;
        }
      }
    }

    onmouseup = () => {
      if (mutated) {
        // Snap width to nearest ITEM_WIDTH px
        itemRef.current.style.width = Math.round(itemRef.current.clientWidth / ITEM_WIDTH) * ITEM_WIDTH + 'px';
        if (e.target.dataset.direction === "left") {
          const scrollPos = getParentRef().current.scrollLeft;
          const rounded = Math.round((event.pageX - e.pageX) / ITEM_WIDTH) * ITEM_WIDTH
          itemRef.current.style.left = scrollPos + x + rounded - 22 + 'px';
        }
        mutated = false;
      }

      // clear event listener
      onmousemove = null;
    }
  }

  return (
    <div
      className="timeline-item"
      ref={itemRef}
      style={{
        left: offset * ITEM_WIDTH,
        width: diff * ITEM_WIDTH,
        top: top * ITEM_HEIGHT,
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
