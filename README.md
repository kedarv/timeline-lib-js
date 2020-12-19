### How long you spent on the assignment.
I spent a decent amount of time researching various aspects of this project, but in terms of pure implementation, I'd guess around 6 hours.

### What you like about your implementation.
It works! I like that for the most part, the UX feels good with scrolling, renaming, and dragging of events enabled. I like the separation of concerns in my design, where the Timeline component is concerned only about bounds and computing lanes, and then TimelineItem is concerned only about presentation and its local state. When TimelineItem changes, it propogates those changes upwards to maintain the parents state. 

### What you would change if you were going to do it again.
Look into alternatives to pixel math. Pixel math got a bit hairy, especially when dealing with resizing and mapping it back to the concept of a "day".

### How you made your design decisions. For example, if you looked at other timelines for inspiration, please note that.

I've written a project that uses a timeline component before to "graph" my team's availability (Google Calendar), stacked with other events like Oncall rotations (Pagerduty): https://github.com/kedarv/team-calendar

 I've never written any graphing library related components myself, so I referred back to my project and also took a closer look at the utilized timeline component https://fullcalendar.io/.

 I also found this super helpful article on resizing divs: https://medium.com/the-z/making-a-resizable-div-in-js-is-not-easy-as-you-think-bda19a1bc53d
 that provided a great starting point for approaching resizing leftwards


### How you would test this if you had more time.
- Event handler testcases: Manual testing user interactions like dragging turned out to be a pain, and not super useful in finding random state-related bugs (eg. ref not existing).
- stackingData logic isn't that complex, but testcases to validate it works would help in building confidence when making changes around that logic