import React from "react";
import LogTable from "./LogTable";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import DateRangePicker from './DateRangePicker';
import ItemDetail from '../Items/ItemDetail';
import DisbursementModal from '../Disbursements/DisbursementModal';
import ViewRequestModal from '../Requests/ViewRequestModal';

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
            maxTime: ""
        };
    }

    getRequestForLog(url_parameter, cb){
        checkAuthAndAdmin(()=>{
          // var url = url_parameter == null ? "/api/logger/" : "/api/logger/" + url_parameter;
          var url = "/api/logger/" + "?nature__tag=" + this.state.actionURLParam +
                    "&initiating_user__username=" + this.state.initiatingUserURLParam +
                    "&affected_user__username=" + this.state.affectedUserURLParam +
                    "&min_time=" + this.state.minTime +
                    "&max_time=" + this.state.maxTime;
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
    }

    onFilterChange(filterObj) {
      console.log(filterObj);
        if (Object.keys(filterObj).length === 0) {
          this.setState({actionURLParam: ""},
            ()=>{
              this.getRequestForLog("", ()=>{
                this.setState({
                    currentPage:1
                });
              });
            }
          );
        }
        // TODO: there's an error but it doesn't break anything
        else{
        this.setState({actionURLParam: this.state.action_filter_obj[filterObj["action_tag"]["value"]]},
          ()=>{
            this.getRequestForLog("", ()=>{
              this.setState({
                  currentPage:1
              });
            });
          }
        );
      }
    }

    onRowClick(row){
      console.log(row);
      if (row.item_log.length !== 0){
        this._child.getDetailedItem(row.item_log[0].item.id, ()=>{
          this._child.setState({showCartChange: false}, ()=>{this._child.openModal();});
        });
      }
      else if (row.shopping_cart_log.length !== 0){
        this.setState({selectedRequest: row.shopping_cart_log[0].shopping_cart.id}, ()=>{
          // get detailed view of shopping cart
          this._requestModal.getDetailedRequest(row.shopping_cart_log[0].shopping_cart.id, ()=>{
            this._requestModal.openModal();
          });
        });
      }
      // else if (row.disbursement_log.length !== 0){
      //   this.disbursementModal.openModal(row);
      // }
    }

    onPageChange(page, sizePerPage) {
        var page_argument = "page=" + page;
        var url_param = this.state.currentFilterURL == null ? "?" + page_argument : this.state.currentFilterURL + "&" + page_argument;
        // console.log(url_param);
        this.getRequestForLog(url_param, ()=>{
          this.setState({
              currentPage: page
          })
        });
    }



    render(){
        return(
          <div>
            <ItemDetail  ref={(child) => { this._child = child; }} updateCallback={this} />
            <ViewRequestModal id={this.state.selectedRequest}
              updateCallback={this}
              ref={(child) => { this._requestModal = child; }} />
            <DisbursementModal cb={this} ref={(child) => { this.disbursementModal = child; }} />
            <LogTable ref="logTable"
                      onRowClick={ this.onRowClick.bind(this) }
                      onPageChange={ this.onPageChange.bind(this) }
                      onFilterChange={ this.onFilterChange.bind(this) }
                      cb={this}
                      { ...this.state }/>
          </div>
        )
    }

}

export default LogComponent
