import React from 'react';
import { render } from 'react-dom';
import 'normalize.css';
import moment from 'moment';
import SortedSet from 'collections/sorted-set';
import timelineItems from './timelineItems';
import TimelineItem from './TimelineItem';
import './index.css';

function TimelineHeading({ heading }) {
  return (
    <th className="timeline-day-heading">
      {heading.format('YYYY-MM-DD')}
      <div className="spacer" />
    </th>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { parsedItems: null, scrolledLeft: 0 };
  }

  componentDidMount() {
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
    // minimum is guaranteed to be the first items' start
    const minDate = this.state.parsedItems[0].start;

    // maximum (ie. the end date) could occur anywhere, so let's search
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

    // Initialize stackingData with range of days to hold lane positioning
    // Initialize date range as array for presentation
    const stackingData = {};
    const headingDates = [];
    for (let i = 0; i <= maxDate.diff(minDate, 'days'); i++) {
      const day = minDate.clone().add(i, 'days');
      stackingData[day] = {};
      headingDates.push(day);
    }

    // Go through each event and populate stackingData
    this.state.parsedItems.forEach((element) => {
      const occupiedLanes = new SortedSet();
      const duration = element.end.diff(element.start, 'days');

      // Go through existing stackingData and push all occupied lanes
      // in entire range of duration
      for (let j = 0; j <= duration; j++) {
        const d = element.start.clone().add(j, 'days');
        for (const [key] of Object.entries(stackingData[d])) {
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

  render() {
    if (this.state.parsedItems === null) {
      return null;
    }
    const { headingDates, stackingData } = this.computeTimeline();

    // Compute height for timeline
    const maxStacked = Object.keys(
      Object.values(stackingData).reduce(
        (prev, curr) => (
          Object.keys(prev).length > Object.keys(curr).length ? prev : curr
        ),
      ),
    ).length;

    return (
      <div>
        <div className="overflow-container" onScroll={(e) => {this.setState({'scrolledLeft': e.target.scrollLeft})}}>
          <div className="wrapper" style={{ height: (maxStacked * 38) + 35 }}>
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
                  scrollPos={this.state.scrolledLeft}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
