import React from 'react';
import { render } from 'react-dom';
import timelineItems from './timelineItems';
import TimelineItem from './TimelineItem';
import 'normalize.css';
import './index.css';
import moment from 'moment';
import SortedSet from 'collections/sorted-set';

function TimelineHeading(props) {
  return (
    <th className="timeline-day-heading">
      {props.heading.format("YYYY-MM-DD")}
      <div className="spacer"></div>
    </th>
  )
}

class App extends React.Component {
  computeTimeline = () => {
    // Convert the input start and end properties to moment objects
    let parsedItems = timelineItems.map(item => {
      return {
        ...item,
        'start': moment(item.start),
        'end': moment(item.end),
      }
    })

    // Sort the array of items by start date
    parsedItems.sort((a, b) => a.start.valueOf() - b.start.valueOf());

    // Calculate bounds of the timeline
    // minimum is guaranteed to be the first items' start
    const minDate = parsedItems[0].start;

    // maximum (ie. the end date) could occur anywhere, so let's search
    const maxDate = parsedItems.reduce(function (prev, curr) {
      return prev.end.valueOf() > curr.end.valueOf() ? prev : curr;
    }).end;

    // Initialize stackingData with range of days to hold lane positioning
    // Initialize date range as array for presentation
    let stackingData = {};
    let headingDates = [];
    for (let i = 0; i <= maxDate.diff(minDate, 'days'); i++) {
      const day = minDate.clone().add(i, 'days');
      stackingData[day] = {};
      headingDates.push(day);
    }

    // Go through each event and populate stackingData 
    parsedItems.forEach(element => {
      let occupiedLanes = new SortedSet();
      const duration = element.end.diff(element.start, 'days');

      // Go through existing stackingData and push all occupied lanes
      // in entire range of duration
      for (let j = 0; j <= duration; j++) {
        const d = element.start.clone().add(j, 'days');
        for (let [key] of Object.entries(stackingData[d])) {
          occupiedLanes.push(Number(key));
        }
      }

      // Find the lowest unused lane index
      let computedLaneIndex = 0;
      for (let k = 0; k < occupiedLanes.length + 1; k++) {
        // If the index is not occupied then claim it
        if (occupiedLanes.get(k) === undefined || k !== occupiedLanes.get(k)) {
          computedLaneIndex = k;
          break;
        }
      }

      // Fill stackingData for duration with computed stack index
      for (let j = 0; j <= duration; j++) {
        const d = element.start.clone().add(j, 'days');
        stackingData[d][computedLaneIndex] = element.id;
      };
    });

    return {
      parsedItems,
      headingDates,
      minDate,
      stackingData
    };
  }

  render() {
    const { parsedItems, headingDates, minDate, stackingData } = this.computeTimeline()

    return (
      <div>
        <div className="container">
          <div className="timeline-wrapper">
            <table className="timeline-scale">
              <thead>
                <tr>
                  {headingDates.map(heading => {
                    return <TimelineHeading heading={heading} key={heading.valueOf()} />
                  })}
                </tr>
              </thead>
            </table>

            <div className="timeline-body">
              <div className="timeline-events">
                {parsedItems.map(item => {
                  return (
                    <TimelineItem
                      {...item}
                      key={item.id}
                      offset={item.start.diff(minDate, 'days')}
                      top={Object.keys(stackingData[item.start]).find(key => stackingData[item.start][key] === item.id)}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>);
  }
};


render(<App />, document.getElementById('root'));
