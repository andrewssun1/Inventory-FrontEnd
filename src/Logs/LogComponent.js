import React from "react";
import LogTable from "./LogTable";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import DateRangePicker from './DateRangePicker';

import LogDetail from './LogDetail';
import AlertComponent from '../AlertComponent';

import { Button } from 'react-bootstrap';
import Select from 'react-select';

var moment = require('moment');

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';


class LogComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            action_list: [],
            action_filter_obj: {},
            _loginState: true,
            currentPage: 1,
            totalDataSize: 0,
            sizePerPage: 30,
            currentFilterURL: null,
            affectedUserURLParam: "",
            initiatingUserURLParam: "",
            actionURLParam: "",
            selectedRequest: 0,
            minTime: "",
            maxTime: "",
            currentUser: ""
        };
        this.handleNameChange = this.handleNameChange.bind(this);
    }

    getRequestForLog(url_parameter, cb){
        checkAuthAndAdmin(()=>{
          // var url = url_parameter == null ? "/api/logger/" : "/api/logger/" + url_parameter;
          var url = "/api/logger/" + "?nature__tag=" + this.state.actionURLParam +
                    "&initiating_user__username=" + this.state.initiatingUserURLParam +
                    "&affected_user__username=" + this.state.affectedUserURLParam +
                    "&min_time=" + this.state.minTime +
                    "&max_time=" + this.state.maxTime +
                    "&item_name=" + ((this.props.itemFilter != null) ? this.props.itemFilter : this.state.currentUser) +
                    "&page=" + this.state.currentPage;
          console.log(url);
          this.setState({currentFilterURL: url});
          restRequest("GET", url, "application/json", null,
                      (responseText)=>{
                        var response = JSON.parse(responseText);
                        console.log(response);
                        for (var i = 0; i < response.results.length; i++){
                            response.results[i]["action_tag"] = response.results[i].nature.tag;
                            response.results[i]["action_color"] = response.results[i].nature.color;
                            response.results[i]["action_id"] = response.results[i].nature.id;
                            response.results[i].timestamp = moment(response.results[i].timestamp).format('lll')
                        }
                        this.setState({
                            data: response.results,
                            totalDataSize: response.count
                        });
                      cb(response);
                      }, ()=>{});
        });
    }

    componentWillMount() {
        //Getting all the Logs
        this.getRequestForLog(null, ()=>{
          checkAuthAndAdmin(()=>{
            restRequest("GET", "/api/logger/action/", "application/json", null,
                        (responseText)=>{
                          var response = JSON.parse(responseText);
                          // console.log(response)
                          var actions = [];
                          var action_filters = {};
                          for (var i=0; i<response.results.length; i++){
                            var id = response.results[i].id;
                            // var color = response.results[i].color;
                            var tag = response.results[i].tag;
                              actions.push(tag);
                              action_filters[parseInt(id, 10)] = tag;
                          }
                          // console.log(action_filters);
                          this.setState({
                              action_list: actions,
                              action_filter_obj: action_filters
                          });
                        }, ()=>{})
                      });
        });
        // Get all items
        checkAuthAndAdmin(()=>{
          restRequest("GET", "/api/item/unique/", "application/json", null,
                      (responseText)=>{
                        var response = JSON.parse(responseText);
                        var items = [];
                        for (var i=0; i<response.results.length; i++){
                          var currItemName = response.results[i].name;
                          items.push({label: currItemName, value: currItemName});
                        }
                        this.setState({
                          item_names: items
                        });
                      }, ()=>{})
                    });
    }

    resetTable(){
      this.getRequestForLog(null, ()=>{});
    }

    onFilterChange(filterObj) {
      console.log(filterObj);
        if (Object.keys(filterObj).length === 0) {
          this.setState({actionURLParam: "", currentPage: 1},
            ()=>{
              this.getRequestForLog("", ()=>{

              });
            }
          );
        }
        // TODO: there's an error but it doesn't break anything
        else{
        this.setState({actionURLParam: this.state.action_filter_obj[filterObj["action_tag"]["value"]], currentPage: 1},
          ()=>{
            this.getRequestForLog("", ()=>{});
          }
        );
      }
    }

    onRowClick(row){
      console.log(row);
      this._logchild.openModal(row);
    }

    onPageChange(page, sizePerPage) {
        // var page_argument = "page=" + page;
        // var url_param = this.state.currentFilterURL == null ? "?" + page_argument : this.state.currentFilterURL + "&" + page_argument;
        // console.log(url_param);
        this.setState({
            currentPage: page
        }, ()=>{
          this.getRequestForLog("", ()=>{
          });
        });

    }

    handleNameChange(value){
      console.log(value);
      this.setState({currentUser: (value === null) ? "" : value, currentPage: 1}, ()=>{
        this.getRequestForLog("", ()=>{});
      })
    }

    render(){
        return(
          <div>
            <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
            {this.props.lightMode ? null :
              <Select simpleValue
                    value={this.state.currentUser}
                    placeholder="Filter by item name"
                    options={this.state.item_names}
                    onChange={this.handleNameChange}
                    style={{width: "200px", marginLeft: "10px"}} />}
            <LogDetail ref={(child) => { this._logchild = child; }} cb={this} ></LogDetail>
            <LogTable ref="logTable"
                      onRowClick={ this.onRowClick.bind(this) }
                      onPageChange={ this.onPageChange.bind(this) }
                      onFilterChange={ this.onFilterChange.bind(this) }
                      cb={this}
                      lightMode={this.props.lightMode}
                      { ...this.state }/>
          </div>
        )
    }

}

export default LogComponent
