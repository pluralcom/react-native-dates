import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);

type DatesType = {
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void,
  focusedMonth:?moment,
  weekHeader?: Object,
  header?: {
    renderLeftLabel?: Function,
    renderCenterLabel?: moment => void,
    renderRightLabel?: Function,
  },
  hideDifferentMonthDays?: boolean,
  styles?: string
}

type MonthType = {
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  currentDate: moment,
  focusedMonth: moment,
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void,
  weekHeader?: {
    dayFormat?: string
  },
  hideDifferentMonthDays?: boolean,
  styles?: string
}

type WeekType = {
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  startOfWeek: moment,
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void,
  focusedMonth: moment,
  hideDifferentMonthDays?: boolean,
  styles?: string
}

const defaultStyles = StyleSheet.create({
  calendar: {
    backgroundColor: 'rgb(255, 255, 255)'
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20
  },
  week: {
    flexDirection: 'row'
  },
  dayName: {
    flexGrow: 1,
    flexBasis: 1,
    textAlign: 'center',
  },
  day: {
    flexGrow: 1,
    flexBasis: 1,
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 245)',
    margin: 1,
    padding: 10
  },
  dayBlocked: {
    backgroundColor: 'rgb(255, 255, 255)'
  },
  daySelected: {
    backgroundColor: 'rgb(52,120,246)'
  },
  dayText: {
    color: 'rgb(0, 0, 0)',
    fontWeight: '600'
  },
  dayDisabledText: {
    color: 'gray',
    opacity: 0.5,
    fontWeight: '400'
  },
  daySelectedText: {
    color: 'rgb(252, 252, 252)'
  },
});

const dates = (startDate: ?moment, endDate: ?moment, focusedInput: 'startDate' | 'endDate') => {
  if (focusedInput === 'startDate') {
    if (startDate && endDate) {
      return ({ startDate, endDate: null, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'endDate' });
  }

  if (focusedInput === 'endDate') {
    if (endDate && startDate && endDate.isBefore(startDate)) {
      return ({ startDate: endDate, endDate: null, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'startDate' });
  }

  return ({ startDate, endDate, focusedInput });
};

export const Week = (props: WeekType) => {
  const {
    range,
    date,
    startDate,
    endDate,
    focusedInput,
    startOfWeek,
    onDatesChange,
    isDateBlocked,
    onDisableClicked,
    hideDifferentMonthDays,
    focusedMonth,
    styles
  } = props;

  const days = [];
  const endOfWeek = startOfWeek.clone().endOf('isoweek');

  const getDayRange = moment.range(startOfWeek, endOfWeek);
  Array.from(getDayRange.by('days')).map((day:moment) => {
    const onPress = () => {
      if (isDateBlocked(day)) {
        onDisableClicked(day);
      } else if (range) {
        let isPeriodBlocked = false;
        const start = focusedInput === 'startDate' ? day : startDate;
        const end = focusedInput === 'endDate' ? day : endDate;
        if (start && end) {
          moment.range(start, end).by('days', (dayPeriod: moment) => {
            if (isDateBlocked(dayPeriod)) isPeriodBlocked = true;
          });
        }
        onDatesChange(isPeriodBlocked ?
            dates(end, null, 'startDate') :
            dates(start, end, focusedInput));
      } else {
        onDatesChange({ date: day });
      }
    };

    const isDateSelected = () => {
      if (range) {
        if (startDate && endDate) {
          return day.isSameOrAfter(startDate, 'day') && day.isSameOrBefore(endDate, 'day');
        }
        return (startDate && day.isSame(startDate, 'day')) || (endDate && day.isSame(endDate, 'day'));
      }
      return date && day.isSame(date, 'day');
    };
    const isCurrentDate = dateToCheck => moment().isSame(dateToCheck, 'day');
    const isCurrentMount = (dateToCheck, month) => moment(month).isSame(dateToCheck, 'month');

    const isBlocked = isDateBlocked(day);
    const isSelected = isDateSelected();
    const isCurrent = isCurrentDate(day);
    const isHideDate = hideDifferentMonthDays ? !isCurrentMount(day, focusedMonth) : false;

    const style = [
      styles.day,
      isBlocked && styles.dayBlocked,
      isCurrent && styles.dayCurrent,
      isSelected && styles.daySelected
    ];

    const styleText = [
      styles.dayText,
      isBlocked && styles.dayDisabledText,
      isCurrent && styles.dayCurrentText,
      isSelected && styles.daySelectedText
    ];

    days.push(
      <TouchableOpacity
        key={day.date()}
        style={style}
        onPress={onPress}
        disabled={isHideDate || (isBlocked && !onDisableClicked)}
      >
        {!isHideDate ? <Text style={styleText}>{day.date()}</Text> : null}
      </TouchableOpacity>
    );
    return null;
  });

  return (
    <View style={styles.week}>{days}</View>
  );
};

Week.defaultProps = {
  hideDifferentMonthDays: false,
  styles: undefined,
};


export const Month = (props: MonthType) => {
  const {
    range,
    date,
    startDate,
    endDate,
    focusedInput,
    currentDate,
    focusedMonth,
    onDatesChange,
    isDateBlocked,
    onDisableClicked,
    hideDifferentMonthDays,
    styles
  } = props;
  const dayFormat = props.weekHeader ? props.weekHeader.dayFormat : 'ddd';

  const dayNames = [];
  const weeks = [];
  const startOfMonth = focusedMonth.clone().startOf('month').startOf('isoweek');
  const endOfMonth = focusedMonth.clone().endOf('month');
  const weekRange = moment.range(currentDate.clone().startOf('isoweek'), currentDate.clone().endOf('isoweek'));

  Array.from(weekRange.by('days')).map((day: moment) => {
    dayNames.push(
      <Text key={day.date()} style={styles.dayName}>
        {day.format(dayFormat)}
      </Text>
    );
    return null;
  });

  const getMonthRange = moment.range(startOfMonth, endOfMonth);
  Array.from(getMonthRange.by('weeks')).map((week: moment) => {
    weeks.push(
      <Week
        key={week}
        range={range}
        date={date}
        startDate={startDate}
        endDate={endDate}
        focusedInput={focusedInput}
        currentDate={currentDate}
        focusedMonth={focusedMonth}
        startOfWeek={week}
        onDatesChange={onDatesChange}
        isDateBlocked={isDateBlocked}
        onDisableClicked={onDisableClicked}
        hideDifferentMonthDays={hideDifferentMonthDays}
        styles={styles}
      />
    );
    return null;
  });


  return (
    <View style={styles.month}>
      <View style={styles.week}>
        {dayNames}
      </View>
      {weeks}
    </View>
  );
};

Month.defaultProps = {
  weekHeader: undefined,
  hideDifferentMonthDays: false,
  styles: undefined,
};

export default class Dates extends Component {
  state = {
    currentDate: moment(),
    focusedMonth: moment().startOf('month')
  }

  componentDidMount() {
    this.setFocusedMonth();
  }

  setFocusedMonth = () => {
    const { focusedMonth } = this.props;
    if (focusedMonth) {
      this.setState({ focusedMonth: moment(focusedMonth, 'MMMM D, YYYY h:mm a').startOf('month') });
    }
  };

  props: DatesType;

  render() {
    const renderLeftLabel = this.props.header ? this.props.header.renderLeftLabel : null;
    const renderCenterLabel = this.props.header ? this.props.header.renderCenterLabel : null;
    const renderRightLabel = this.props.header ? this.props.header.renderRightLabel : null;

    const previousMonth = () => {
      this.setState({ focusedMonth: this.state.focusedMonth.add(-1, 'M') });
    };

    const nextMonth = () => {
      this.setState({ focusedMonth: this.state.focusedMonth.add(1, 'M') });
    };

    const styles = { ...defaultStyles, ...(this.props.styles || {}) };

    return (
      <View style={styles.calendar}>
        <View style={styles.heading}>
          <TouchableOpacity onPress={previousMonth}>
            {renderLeftLabel ? renderLeftLabel() : <Text>{'< Previous'}</Text>}
          </TouchableOpacity>
          {renderCenterLabel
            ? renderCenterLabel(this.state.focusedMonth)
            : <Text>{this.state.focusedMonth.format('MMMM')}</Text>
          }
          <TouchableOpacity onPress={nextMonth}>
            {renderRightLabel ? renderRightLabel() : <Text>{'Next >'}</Text>}
          </TouchableOpacity>
        </View>
        <Month
          range={this.props.range}
          date={this.props.date}
          startDate={this.props.startDate}
          endDate={this.props.endDate}
          focusedInput={this.props.focusedInput}
          currentDate={this.state.currentDate}
          focusedMonth={this.state.focusedMonth}
          onDatesChange={this.props.onDatesChange}
          isDateBlocked={this.props.isDateBlocked}
          onDisableClicked={this.props.onDisableClicked}
          styles={styles}
          weekHeader={this.props.weekHeader}
          hideDifferentMonthDays={this.props.hideDifferentMonthDays}
        />
      </View>
    );
  }
}


Dates.defaultProps = {
  weekHeader: undefined,
  header: undefined,
  hideDifferentMonthDays: false,
  styles: undefined,
};
