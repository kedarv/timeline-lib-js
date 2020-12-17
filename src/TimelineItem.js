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
  name, end, start, id, offset, top, handleUpdateItem,
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
    onmousemove = (event) => {
      
      if (e.target.dataset.direction === "right") {
        const computedWidth = width + (event.pageX - e.pageX);

        // Make sure we don't go less than one day
        if (computedWidth > 117) {
          itemRef.current.style.width = computedWidth + 'px';
        }
      } else if(e.target.dataset.direction === "left") {
        const computedWidth = width - (event.pageX - e.pageX);
        console.log(x);
        itemRef.current.style.width = computedWidth + 'px';
        itemRef.current.style.left = x+(event.pageX - e.pageX) -22 + 'px';
      }
    }
    onmouseup = () => {
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

function makeResizableDiv(div) {
  const element = document.querySelector(div);
  const resizers = document.querySelectorAll(div + ' .resizer')
  const minimum_size = 20;
  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;
  for (let i = 0; i < resizers.length; i++) {
    const currentResizer = resizers[i];
    currentResizer.addEventListener('mousedown', function (e) {
      e.preventDefault()
      original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
      original_x = element.getBoundingClientRect().left;
      original_y = element.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)
    })

    function resize(e) {
      if (currentResizer.classList.contains('right')) {
        const width = original_width + (e.pageX - original_mouse_x);

        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
      }
      else if (currentResizer.classList.contains('left')) {
        const width = original_width - (e.pageX - original_mouse_x)
        if (width > minimum_size) {
          element.style.width = width + 'px'
          element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
        }
      }
      else if (currentResizer.classList.contains('top')) {

        const height = original_height - (e.pageY - original_mouse_y)
        if (height > minimum_size) {
          element.style.height = height + 'px'
          element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
        }
      }

      else if (currentResizer.classList.contains('bottom')) {
        const height = original_height + (e.pageY - original_mouse_y)
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }

      }
    }

    function stopResize() {
      window.removeEventListener('mousemove', resize)
    }
  }
}


export default TimelineItem;
