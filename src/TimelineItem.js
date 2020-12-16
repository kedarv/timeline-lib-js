import React from 'react';
import './index.css';
import moment from 'moment';

function TimelineItem(props) {
    const start = moment(props.start);
    const end = moment(props.end);
    const diff = end.diff(start, 'days') ? end.diff(start, 'days') : 1;

    let top = props.top > -1 ? props.top : 0;
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    return (
        <div
            className={"timeline-item"}
            style={{
                'left': props.offset * 117,
                'width': diff * 117,
                'top': top * 38,
                'backgroundColor': "#"+randomColor,
            }}
        >
            {props.name}
        </div>
    );
}

export default TimelineItem;