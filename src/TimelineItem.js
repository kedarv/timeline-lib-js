import React from 'react';
import './index.css';

function TimelineItem(props) {
    console.log(props.offset)
    return <div className={"timeline-item"} style={{'left': props.offset*117}}>{props.name}</div>;
}

export default TimelineItem;