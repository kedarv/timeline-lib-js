import React, { useState, useRef } from 'react';
import './index.css';

const colorArray = [
  '#001f3f', '#0074D9', '#39CCCC', '#3D9970', '#2ECC40', '#FF851B',
  '#FF4136', '#85144b', '#F012BE', '#B10DC9', '#AAAAAA',
];
const ITEM_WIDTH = 117;
export const ITEM_HEIGHT = 38;
const LEFT_EDGE_PADDING = 22;

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

    // https://reactjs.org/docs/legacy-event-pooling.html
    e.persist();

    // width and x coord at the time of beginning resize
    const width = itemRef.current.clientWidth;
    const left = itemRef.current.getBoundingClientRect().left;

    // bool flag to determine to snap or not
    let mutated = false;

    // let current event display on top of everything else
    itemRef.current.style.zIndex = 1;

    onmousemove = (event) => {
      if (e.target.dataset.direction === "right") {
        // New width is old width + (current x position - old x position)
        // (current x position - old x position) is the "growth" in pixels
        let computedWidth = width + (event.pageX - e.pageX);

        // Make sure we don't go less than one day
        if (computedWidth > ITEM_WIDTH) {
          itemRef.current.style.width = computedWidth + 'px';
          mutated = true;
        }
      } else if (e.target.dataset.direction === "left") {
        // New width is old width - current x position - old x position
        // This is a bit confusing, so here's an illustration for future reference
        // https://i.imgur.com/MaLjk2T.png
        const computedWidth = width - (event.pageX - e.pageX);

        // Make sure we don't go less than one day
        if (computedWidth > ITEM_WIDTH) {
          itemRef.current.style.width = computedWidth + 'px';
          mutated = true;

          // Snap the left edge to where we dragged to
          // use scrollLeft in case we scrolled down the timeline
          const scrollPos = getParentRef().current.scrollLeft;
          itemRef.current.style.left = scrollPos + left + (event.pageX - e.pageX) - LEFT_EDGE_PADDING + 'px';
        }
      }
    }

    onmouseup = () => {
      if (mutated) {
        // Snap width to nearest ITEM_WIDTH (ie. days) px
        itemRef.current.style.width = Math.round(itemRef.current.clientWidth / ITEM_WIDTH) * ITEM_WIDTH + 'px';

        // Calculate growth in days
        const pixelGrowth = (itemRef.current.clientWidth - width);
        const growthInDays = (Math.round(pixelGrowth / ITEM_WIDTH) * ITEM_WIDTH) / ITEM_WIDTH;

        // propogate date change upwards to change the underlying data
        if (e.target.dataset.direction === "right") {
          propogateUpdates(undefined, undefined, end.add(growthInDays, 'days'));
        } else if (e.target.dataset.direction === "left") {
          // Same idea as the mousemove handler, growth the left side to the snapped width
          const scrollPos = getParentRef().current.scrollLeft;
          const rounded = Math.round((event.pageX - e.pageX) / ITEM_WIDTH) * ITEM_WIDTH
          itemRef.current.style.left = scrollPos + left + rounded - LEFT_EDGE_PADDING + 'px';
          propogateUpdates(undefined, start.subtract(growthInDays, 'days'));
        }
        mutated = false;
      }

      // clear event listener and always set z-index to auto, for good measure
      onmousemove = null;
      itemRef.current.style.zIndex = "auto";
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
      <div className='resize-control resize-right' data-direction={"right"} onMouseDown={handleOnResize}></div>
      <div className='resize-control resize-left' data-direction={"left"} onMouseDown={handleOnResize}></div>

      {isEditMode ? <TimelineItemEditor name={name} submit={propogateUpdates} />
        : <span onClick={() => setIsEditMode(!isEditMode)} title={name}>{name}</span>}
    </div>
  );
}

export default TimelineItem;
