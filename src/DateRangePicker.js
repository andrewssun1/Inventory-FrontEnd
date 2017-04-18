import 'rc-calendar/assets/index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import RangeCalendar from 'rc-calendar/lib/RangeCalendar';
import DatePicker from 'rc-calendar/lib/Picker';
import enUS from 'rc-calendar/lib/locale/en_US';
import {FormGroup, FormControl, InputGroup, Label, Col, Button} from 'react-bootstrap';


import moment from 'moment';
import 'moment/locale/en-gb';

const format = 'YYYY-MM-DD';
const fullFormat = 'YYYY-MM-DD';

const now = moment();

class Picker extends React.Component {
  render() {
    const props = this.props;
    const { showValue } = props;
    const calendar = (
      <RangeCalendar
        type={this.props.type}
        locale={enUS}
        defaultValue={now}
        format={format}
        onChange={props.onChange}
        disabledDate={props.disabledDate}
      />);
    return (
      <DatePicker
        open={this.props.open}
        onOpenChange={this.props.onOpenChange}
        calendar={calendar}
        value={props.value}
      >
        {
          () => {
            return (
              <FormControl
                placeholder={this.props.placeholder}
                style={{backgroundColor: "transparent"}}
                readOnly
                value={showValue && showValue.format(fullFormat) || ''}
              />

            );
          }
        }
      </DatePicker>);
  }
}

export default class DateRangePicker extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      startValue: null,
      endValue: null,
      startOpen: false,
      endOpen: false,
    }
    this.onStartOpenChange = this.onStartOpenChange.bind(this);
    this.onEndOpenChange = this.onEndOpenChange.bind(this);
    this.onStartChange = this.onStartChange.bind(this);
    this.onEndChange = this.onEndChange.bind(this);
    this.disabledStartDate = this.disabledStartDate.bind(this);
    this.clearDates = this.clearDates.bind(this);
  }

  onStartOpenChange(startOpen) {
    this.setState({
      startOpen,
    });
  }

  onEndOpenChange(endOpen) {
    this.setState({
      endOpen,
    });
  }

  onStartChange(value) {
    this.setState({
      startValue: value[0],
      startOpen: false,
      endOpen: true,
    });
  }

  onEndChange(value) {
    this.setState({
      endValue: value[1],
    });
    var min_time = value[0].format();
    var max_time = value[1].endOf('day').format();
    this.props.cb.setState({minTime: min_time, maxTime: max_time},
      ()=>{
        this.props.cb.didFinishChangeState("", ()=>{
          this.props.cb.setState({
              currentPage:1
          });
        });
      }
    );
  }

  disabledStartDate(endValue) {
    if (!endValue) {
      return false;
    }
    const startValue = this.state.startValue;
    if (!startValue) {
      return false;
    }
    return endValue.diff(startValue, 'days') < 0;
  }

  clearDates(){
    this.setState({
      startValue: null,
      endValue: null
    });
    this.props.cb.setState({minTime: "", maxTime: ""},
      ()=>{
        this.props.cb.didFinishChangeState("", ()=>{
          this.props.cb.setState({
              currentPage:1
          });
        });
      }
    );
  }

  render() {
    const state = this.state;
    return (
      <div>
        <Picker
            onOpenChange={this.onStartOpenChange}
            type="start"
            showValue={state.startValue}
            open={this.state.startOpen}
            value={[state.startValue, state.endValue]}
            onChange={this.onStartChange}
            placeholder="Start date"
          />
          <Picker
            onOpenChange={this.onEndOpenChange}
            open={this.state.endOpen}
            type="end"
            showValue={state.endValue}
            disabledDate={this.disabledStartDate}
            value={[state.startValue, state.endValue]}
            onChange={this.onEndChange}
            placeholder="End date"
          />
          <Button onClick={this.clearDates} bsSize="sm">Clear</Button>
    </div>);
  }
}
