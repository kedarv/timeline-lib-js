import React from 'react';
import { render } from 'react-dom';
import timelineItems from './timelineItems';
import TimelineItem from './TimelineItem';
import 'normalize.css';
import './index.css';
import moment from 'moment';

class App extends React.Component {

  computeBoundaries = () => {
    // TODO: convert everything to moments

    const min = timelineItems.reduce(function (prev, curr) {
      return Date.parse(prev.start) < Date.parse(curr.start) ? prev : curr;
    });

    const max = timelineItems.reduce(function (prev, curr) {
      return Date.parse(prev.end) > Date.parse(curr.end) ? prev : curr;
    });

    const minDate = moment(min.start);
    const maxDate = moment(max.end);
    const days = maxDate.diff(minDate, 'days')

    let stackingData = {};
    for (let i = 0; i < days; i++) {
      stackingData[minDate.clone().add(i, 'days')] = {};
    }
    console.log(stackingData);
    timelineItems.forEach(element => {
      const start = moment(element.start);
      const end = moment(element.end);
      // go from start to end by adding one day
      for (let j = 0; j < end.diff(start, 'days'); j++) {
        const d = start.clone().add(j, 'days');
        const itemsLength = Object.keys(stackingData[d]).length;
        if (itemsLength === 0) {
          console.log("nothing found in " + d.format("YYYY-MM-DD"))
          stackingData[d][0] = element.id;
        } else {
          for (let k = 0; k < itemsLength + 1; k++) {
            if (!(k in stackingData[d])) {
              stackingData[d][k] = element.id;
              break;
            }
          }
        }
        // console.log(d);
        console.log(stackingData[d]);
      }
    });

    return {
      days,
      minDate,
      maxDate,
      stackingData
    };
  }

  render() {
    const { days, minDate, maxDate, stackingData } = this.computeBoundaries()
    let items = [];

    for (let i = 0; i < days; i++) {
      items.push(minDate.clone().add(i, 'days'));
    }

    return (
      <div>
        <div class="container">
          <div class="timeline-wrapper">
            <table class="timeline-scale">
              <thead>
                <tr>
                  {items.map((item, index) => {
                    return (<th class="timeline-day-heading">{item.format("YYYY-MM-DD")}<div class="spacer"></div></th>)
                  })}
                </tr>
              </thead>
            </table>

            <div class="timeline-body">
              <div class="timeline-events">
                {timelineItems.map((item, index) => {
                  return (
                    <TimelineItem
                      {...item}
                      offset={moment(item.start).diff(minDate, 'days')}
                      top={Object.keys(stackingData[moment(item.start)]).find(key => stackingData[moment(item.start)][key] === item.id)}></TimelineItem>
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
