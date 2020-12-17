import React from 'react';
import './index.css';

function TimelineItem(props) {
    const diff = props.end.diff(props.start, 'days') ? props.end.diff(props.start, 'days') : 1;
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    props.updateItemTime(props.id, props.start, props.end.clone().add(20, 'days'))
    return (
        <div
            className={"timeline-item"}
            style={{
                'left': props.offset * 117,
                'width': diff * 117,
                'top': props.top * 38,
                'backgroundColor': "#" + randomColor,
            }}
        >
            {props.name}
        </div>
    );
}

export default TimelineItem;