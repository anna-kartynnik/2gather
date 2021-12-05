const moment = require('moment');

const DEFAULT_NUMBER_OF_SLOTS = 3;
const DEFAULT_TIME_SHIFT = 15 * 60 * 1000; // 15 min
const DEFAULT_MORNING_HOUR = 8;
const DEFAULT_EVENING_HOUR = 20;

class TimePoint {
  constructor(point, isStart, reference) {
    this.point = point;
    this.reference = reference;
    this.isStart = isStart;
  }

  compare(other) {
    if (this.point === other.point) {
      if (this.isStart !== other.isStart) {
        return this.isStart ? 1 : -1;
      }
      return 0;
    } else {
      return this.point - other.point;
    }
  }
}

class Slot {
  constructor(start, end, numberOfOverlaps) {
    this.start = start;
    this.end = end;
    this.numberOfOverlaps = numberOfOverlaps;
    // todo delete
    this.startDate = new Date(start);
    this.endDate = new Date(end);
  }

  compare(other) {
    if (this.numberOfOverlaps !== other.numberOfOverlaps) {
      // Intervals with less overlaps should have higher priority.
      return this.numberOfOverlaps - other.numberOfOverlaps;
    } else {
      // Intervals with larger length should have higher priority, i.e. sorting by length in descending order.
      // [TODO] we definitely should sort free slots by length (desc) but what about busy slots?
      // [TODO] shouldn't we create a better solution?
      return (other.end - other.start) - (this.end - this.start);
    }
  }

  compareForChoice(other) {
    if (this.numberOfOverlaps !== other.numberOfOverlaps) {
      // Intervals with less overlaps should have higher priority.
      return this.numberOfOverlaps - other.numberOfOverlaps;
    } else {
      return moment(this.start).minutes() - moment(other.start).minutes();
    }
  }
}

function getDefaultBusySlots(preferredTimeStart, preferredTimeEnd, participantsTimeZones) {
  const participantsTimeZonesSet = new Set(participantsTimeZones);
  const busySlots = [];
  let time = moment(preferredTimeStart).utc().milliseconds(0); // make sure utc?
  const periodEndTime = moment(preferredTimeEnd).utc().milliseconds(0);
  let index = 0;
  while (time.isSameOrBefore(periodEndTime, 'day')) {
    for (let tz of participantsTimeZonesSet) {
      busySlots.push({
        start: moment(time).subtract(1, 'days').utcOffset(tz).set('hour', DEFAULT_EVENING_HOUR).toISOString(),
        end: moment(time).utcOffset(tz).set('hour', DEFAULT_MORNING_HOUR).toISOString()
      });
    }
    time = moment(time.add(1, 'days'));
    index++;
    if (index === 5) {
      break;
    }
  }
  console.log('default busy slots');
  console.log(busySlots);
  return busySlots;
}

function chooseFromIntervals(intervals, duration) {
  // `intervals` should be sorted
  // [TODO] improve, this is an initial version
  const slots = [];
  const durationMs = duration * 60 * 1000;
  for (let interval of intervals) {
    let start = interval.start;
    while (interval.end - start >= durationMs) {
      slots.push(new Slot(
        start,
        start + durationMs,
        interval.numberOfOverlaps
      ));
      start += DEFAULT_TIME_SHIFT;
    }
  }

  //console.log('chosen slots');
  //console.log(slots);

  slots.sort((a, b) => a.compareForChoice(b));

  //console.log('chosen slots after sorting');
  //console.log(slots);

  // Select 3 slots.
  // [TODO] how to select slots without intersection (as much as it's possible)?..

  return slots.slice(0, DEFAULT_NUMBER_OF_SLOTS);
}

function getProposedSlots(busySlots, preferredTimeStart, preferredTimeEnd, duration,
                          participantsTimeZones) {
  // `busySlots` is an array of objects with 'start' and 'end' in UTC.
  // Here we have all busy slots for all the participants combined.

  // Add obviously busy slots (night time).
  const allBusySlots = [...busySlots];
  allBusySlots.push(...getDefaultBusySlots(
    preferredTimeStart,
    preferredTimeEnd,
   
    participantsTimeZones
  ));

  // console.log('all busy slots');
  // console.log(allBusySlots);

  const startTimeMs = new Date(moment(preferredTimeStart).milliseconds(0).toISOString()).getTime(); // check UTC
  const endTimeMs = new Date(moment(preferredTimeEnd).milliseconds(0).toISOString()).getTime(); // check UTC

  // First collect all the start and end slot times (points) into one combined list.
  let timePoints = [];
  for (let busySlot of allBusySlots) {
    let start = new Date(busySlot.start).getTime();
    let end = new Date(busySlot.end).getTime();
    if (moment(start).isAfter(preferredTimeEnd) || moment(end).isBefore(preferredTimeStart)) {
      continue;
    }
    if (moment(start).isBefore(preferredTimeStart)) {
      start = startTimeMs;
    }
    if (moment(end).isAfter(preferredTimeEnd)) {
      end = endTimeMs;
    }
    timePoints.push(new TimePoint(start, true, busySlot));
    timePoints.push(new TimePoint(end, false, busySlot));
  }

  // console.log('all busy slots points');
  // console.log(timePoints);

  // First sort the slots by the start time.
  timePoints.sort((a, b) => {
    return a.compare(b);
  });

  // console.log('all busy slots points after sorting');
  // console.log(timePoints);

  const intervals = [];
  let start = startTimeMs;
  let numberOfOverlaps = 0;
  for (let timePoint of timePoints) {
    if (start !== timePoint.point) {
      // Interval length is not zero.
      intervals.push(new Slot(
        start,
        timePoint.point,
        numberOfOverlaps
      ));

    }
    start = timePoint.point;
    if (timePoint.isStart) {
      numberOfOverlaps++;
    } else {
      numberOfOverlaps--;
    }
  }
  if (start < endTimeMs) {
    // Add the last interval that ends where preferred range ends.
    intervals.push(new Slot(
      start,
      endTimeMs,
      numberOfOverlaps
    ));    
  }
  // console.log('all intervals');
  // console.log(intervals);

  // Merge intervals that "touch" each other and have identical number of overlaps.
  const mergedIntervals = [];
  if (intervals.length <= 1) {
    mergedIntervals = [...intervals];
  } else {
    let i = 0;
    while (i < intervals.length) {
      let interval = intervals[i];
      let nextInterval = i === intervals.length - 1 ?
        new Slot(interval.end, interval.end, interval.numberOfOverlaps) :
        intervals[i + 1];
      const start = interval.start;
      while (interval.end === nextInterval.start && interval.numberOfOverlaps === nextInterval.numberOfOverlaps) {
        i++;
        interval = nextInterval;
        if (i >= intervals.length - 1) {
          break;
        }
        nextInterval = intervals[i + 1];
      }
      mergedIntervals.push(new Slot(
        start,
        interval.end,
        interval.numberOfOverlaps
      ));
      i++;
    }
  }

  // console.log('all merged intervals');
  // console.log(mergedIntervals);

  mergedIntervals.sort((a, b) => {
    return a.compare(b);
  });

  // console.log('all intervals after sorting');
  // console.log(mergedIntervals);

  // Find 3 slots
  const proposedSlots = chooseFromIntervals(mergedIntervals, duration);

  console.log('proposed slots');
  console.log(proposedSlots);
  
  // [TODO] set final timezone!

  return proposedSlots.map((slot) => moment(slot.start).utc().toISOString());
  
}

exports.getProposedSlots = getProposedSlots;
