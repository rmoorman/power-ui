/** @jsx hJSX */
import {hJSX} from '@cycle/dom';
import _ from 'lodash';
import moment from 'moment';
import styles from './styles.scss';
import {timeRangeIndexArray} from 'power-ui/utils';

const caseHeight = 25;
const laneHeightAndMargin = caseHeight + 3;

function renderMonthSeparators(indexArray) {
  return indexArray.map(i => {
    const style = {left: `${(i / indexArray.length) * 100}%`};
    return <div style={style} className={styles.monthSeparator}></div>;
  });
}

function renderNowMarker(timeRange) {
  const totalTime = timeRange.end.diff(timeRange.start);
  const nowTime = moment().diff(timeRange.start);
  if (nowTime < 0) {
    return null;
  }
  const nowLeftPercentage = (nowTime / totalTime) * 100;
  const style = {left: `${nowLeftPercentage}%`};
  return (
    <div>
      <span className={styles.nowLabel} style={style}>Now</span>
      <div className={styles.nowSeparator} style={style}></div>
    </div>
  );
}

function renderMonthLabels(timeRange, indexArray) {
  const monthLabelWidth = `${100 / indexArray.length}%`;
  return indexArray.map(i => {
    const monthName = timeRange.start.clone().add(i, 'months').format('MMMM');
    const className = styles.timelineMonthLabel;
    const style = {
      'width': monthLabelWidth,
      'left': `${(i / indexArray.length) * 100}%`,
    };
    return <span className={className} style={style}>{monthName}</span>;
  });
}

function renderTimelineHeader(timeRange) {
  const indexArray = timeRangeIndexArray(timeRange);
  return (
    <th className={styles.timelineColumnHeader}>
      {renderMonthLabels(timeRange, indexArray)}
      {renderMonthSeparators(indexArray)}
      {renderNowMarker(timeRange)}
    </th>
  );
}

function renderSingleCase(theCase, laneIndex) {
  const liStyle = {
    'left': `${theCase.leftStart}%`,
    'top': `${laneIndex * (laneHeightAndMargin)}px`,
    'height': `${caseHeight}px`,
    'width': `${theCase.leftEnd - theCase.leftStart}%`,
  };
  const bgStyle = {opacity: theCase.opacity};
  return (
    <li style={liStyle} className={styles.caseItem}>
      <div style={bgStyle} className={theCase.backgroundClass} />
      <span className={styles.caseItemLabel}>{theCase.label}</span>
    </li>
  );
}

// renderSingleLane :: [case] -> index -> [caseElem]
function renderSingleLane(theLane, indexInList) {
  return theLane.map(theCase => renderSingleCase(theCase, indexInList));
}

// intersect :: x1 -> x2 -> y1 -> y2 -> boolean
function intersect(a1, a2, b1, b2) {
  return a2 > b1 && b2 > a1;
}

// caseFitsToLane :: case -> [case] -> boolean
function caseFitsToLane(theCase, lane) {
  return !lane.some(laneItem =>
    intersect(laneItem.leftStart, laneItem.leftEnd, theCase.leftStart, theCase.leftEnd)
  );
}

// compactCases :: [case] -> [[case]]
function compactCases(allCases) {
  const allocations = allCases.filter(c => c.type === 'allocation');
  const absences = allCases.filter(c => c.type !== 'allocation');

  const lanes = allocations.reduce((laneArray, theCase) => {
    let firstAvailableLane = laneArray.find(_.curry(caseFitsToLane)(theCase));
    if (typeof firstAvailableLane === 'undefined') {
      firstAvailableLane = [];
      laneArray.push(firstAvailableLane);
    }
    firstAvailableLane.push(theCase);
    return laneArray;
  }, []);

  // see if we can fit all absences to any existing single lane.
  const laneForAbsences = lanes.find(lane => {
    const fitsToLane = _.curryRight(caseFitsToLane)(lane);
    return absences.every(absenceCase => fitsToLane(absenceCase));
  });

  if (typeof laneForAbsences !== 'undefined') {
    absences.forEach(a => laneForAbsences.push(a));
  } else {
    lanes.push(absences);
  }

  return lanes;
}

function measureCaseWith(timeRange) {
  const totalTime = timeRange.end.diff(timeRange.start);
  return function measureCase({start_date, end_date, label, opacity, type}) {
    const allocationStart = moment(start_date).diff(timeRange.start);
    const allocationEnd = moment(end_date).add(1, 'day').diff(timeRange.start);
    const leftStart = (Math.max(0, allocationStart) / totalTime) * 100;
    const leftEnd = (Math.min(totalTime, allocationEnd) / totalTime) * 100;
    const backgroundClass = type === 'allocation'
      ? styles.caseItemBackgroundAllocation
      : styles.caseItemBackgroundAbsence;
    return {leftStart, leftEnd, backgroundClass, label, opacity, type};
  };
}

function preprocessAllocationCase(allocation) {
  return {
    type: 'allocation',
    label: allocation.project.name,
    start_date: allocation.start_date,
    end_date: allocation.end_date,
    opacity: parseFloat(allocation.total_allocation),
  };
}

function preprocessAbsenceCase(absence) {
  return {
    type: 'absence',
    label: 'Absence',
    start_date: absence.start_date,
    end_date: absence.end_date,
    opacity: 1,
  };
}

function isCaseInTimeRange(timeRange) {
  return c => (
    moment(c.end_date).isAfter(timeRange.start)
    && moment(c.start_date).isBefore(timeRange.end)
  );
}

function renderTimelineCases(person, timeRange) {
  const allocationCases = person.allocations.map(preprocessAllocationCase);
  const absenceCases = person.absences.map(preprocessAbsenceCase);
  const allCases = allocationCases.concat(absenceCases)
    .filter(isCaseInTimeRange(timeRange))
    .map(measureCaseWith(timeRange));

  const lanes = compactCases(allCases).map(renderSingleLane);

  const style = {height: `${lanes.length * (laneHeightAndMargin)}px`};
  return (
    <ul style={style} className={styles.casesList}>
      {lanes}
    </ul>
  );
}

export default {renderTimelineHeader, renderTimelineCases};
