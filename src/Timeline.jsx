import React from 'react';
import 'normalize.css';
import moment from 'moment';
import timelineItems from './timelineItems';
import TimelineItem, { ITEM_HEIGHT } from './TimelineItem';
import './index.css';

function TimelineHeading({ heading }) {
  return (
    <th className="timeline-day-heading">
      {heading.format('YYYY-MM-DD')}
      <div className="spacer" />
    </th>
  );
}

const HEADING_HEIGHT = 35;

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = { parsedItems: null, scrolledLeft: 0 };
    this.parentElem = React.createRef();
  }

  componentDidMount() {
    // only parseItems on mount since this could be expensive
    // (imagine underlying network calls, large datasets)
    this.setState({ parsedItems: this.parseItems() });
  }

  // Convert the input timestamps to moment objects and sort by start
  parseItems = () => {
    const parsedItems = timelineItems.map((item) => ({
      ...item,
      start: moment(item.start),
      end: moment(item.end),
    }));

    // Sort the array of items by start date
    parsedItems.sort((a, b) => a.start.valueOf() - b.start.valueOf());
    return parsedItems;
  }

  // Calculate bounds of the timeline
  getGlobalBounds = () => {
    // search for the minimum date (the smallest start)
    const minDate = this.state.parsedItems.reduce(
      (prev, curr) => (prev.start.valueOf() < curr.start.valueOf() ? prev : curr),
    ).start;

    // search for the maximum date (the largest end)
    const maxDate = this.state.parsedItems.reduce(
      (prev, curr) => (prev.end.valueOf() > curr.end.valueOf() ? prev : curr),
    ).end;

    return {
      minDate,
      maxDate,
    };
  }

  computeTimeline = () => {
    const { minDate, maxDate } = this.getGlobalBounds();

    // Initialize stackingData as [day]{index: eventID} with range of days to hold lane positioning
    // Initialize date range as array for easier presentation
    const stackingData = {};
    const headingDates = [];
    for (let i = 0; i <= maxDate.diff(minDate, 'days'); i++) {
      const day = minDate.clone().add(i, 'days');
      stackingData[day] = {};
      headingDates.push(day);
    }

    // Go through each event and populate stackingData
    this.state.parsedItems.forEach((element) => {
      const occupiedLanes = new Set();
      const duration = element.end.diff(element.start, 'days');

      // Go through existing stackingData and push all occupied lanes
      // in entire range of duration
      for (let j = 0; j <= duration; j++) {
        const d = element.start.clone().add(j, 'days');
        for (const [key] of Object.entries(stackingData[d])) {
          occupiedLanes.add(Number(key));
        }
      }

      // Find the lowest unused lane index
      // Convert Set to sorted array
      const sortedOccupiedLanes = Array.from(occupiedLanes).sort((a, b) => a - b);
      let computedLaneIndex = 0;
      for (let k = 0; k < sortedOccupiedLanes.length + 1; k++) {
        // note we loop length + 1, which could result in k undefined
        // this happens if all lanes are occupied, in which case we create a new lane 
        if (sortedOccupiedLanes[k] === undefined || k !== sortedOccupiedLanes[k]) {
          computedLaneIndex = k;
          break;
        }
      }

      // Fill stackingData for duration with "claimed" index
      for (let j = 0; j <= duration; j++) {
        const d = element.start.clone().add(j, 'days');
        stackingData[d][computedLaneIndex] = element.id;
      }
    });

    return {
      headingDates,
      stackingData,
    };
  }

  handleUpdateItem = (id, name, start, end) => {
    const parsedItems = [...this.state.parsedItems];
    const index = parsedItems.findIndex((x) => x.id === id);
    parsedItems[index] = {
      ...parsedItems[index],
      name,
      start,
      end,
    };
    this.setState({ parsedItems });
  }

  getParentElem = () => {
    return this.parentElem;
  }

  render() {
    if (this.state.parsedItems === null) {
      return null;
    }
    const { headingDates, stackingData } = this.computeTimeline();

    // Maximum stacked lanes used to compute height for the timeline
    // Multiply by the height of each item, and add the heading table height
    const timelineHeight = Object.keys(
      Object.values(stackingData).reduce(
        (prev, curr) => (
          Object.keys(prev).length > Object.keys(curr).length ? prev : curr
        ),
      ),
    ).length * ITEM_HEIGHT + HEADING_HEIGHT;

    return (
      <>
        <div className="overflow-container" ref={this.parentElem}>
          <div className="wrapper" style={{ height: timelineHeight }}>
            <table className="headings">
              <thead>
                <tr>
                  {
                    headingDates.map(
                      (heading) => <TimelineHeading heading={heading} key={heading.valueOf()} />,
                    )
                  }
                </tr>
              </thead>
            </table>
            <div className="timeline-items">
              {this.state.parsedItems.map((item) => (
                <TimelineItem
                  {...item}
                  key={item.id}
                  offset={item.start.diff(headingDates[0], 'days')}
                  top={
                    Object.keys(stackingData[item.start])
                      .find((key) => stackingData[item.start][key] === item.id)
                  }
                  handleUpdateItem={this.handleUpdateItem}
                  getParentRef={this.getParentElem}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Timeline;
