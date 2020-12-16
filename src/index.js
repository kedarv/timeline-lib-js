import React from 'react';
import { render } from 'react-dom';
import timelineItems from './timelineItems';
import TimelineItem from './TimelineItem';
import 'normalize.css';
import './index.css';
import moment from 'moment';

class App extends React.Component {

  computeBoundaries = () => {
    const min = timelineItems.reduce(function (prev, curr) {
      return Date.parse(prev.start) < Date.parse(curr.start) ? prev : curr;
    });

    const max = timelineItems.reduce(function (prev, curr) {
      return Date.parse(prev.end) > Date.parse(curr.end) ? prev : curr;
    });

    const minDate = moment(min.start);
    const maxDate = moment(max.end);
    const days = maxDate.diff(minDate, 'days')

    return {
      days,
      minDate,
      maxDate
    };
  }

  render() {
    const { days, minDate, maxDate } = this.computeBoundaries()
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
                  return <TimelineItem {...item} offset={moment(item.start).diff(minDate, 'days')}></TimelineItem>
                })}

              </div>
            </div>
          </div>

        </div>
      </div>);
  }
};


render(<App />, document.getElementById('root'));
