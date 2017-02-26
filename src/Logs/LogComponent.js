import React from "react";
import LogTable from "./LogTable";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js"

var moment = require('moment');

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
            currentFilterURL: null
        };
    }

    getRequestForLog(url_parameter, cb){
        checkAuthAndAdmin(()=>{
          var url = url_parameter == null ? "/api/logger/" : "/api/logger/" + url_parameter;
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
                          console.log(response)
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
        if (Object.keys(filterObj).length === 0) {
            this.getRequestForLog(null, ()=>{
              this.setState({
                  currentFilterURL: null
              });
              return;
            });
        }
        // TODO: there's an error but it doesn't break anything
        var filter_url_param = "?nature__tag=" + this.state.action_filter_obj[filterObj["action_tag"]["value"]];
        this.getRequestForLog(filter_url_param, ()=>{
          this.setState({
              currentPage:1,
              currentFilterURL: filter_url_param
          });
        });
    }

    onRowClick(row){
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
            <LogTable ref="logTable"
                      onRowClick={ this.onRowClick.bind(this) }
                      onPageChange={ this.onPageChange.bind(this) }
                      onFilterChange={ this.onFilterChange.bind(this) }
                      { ...this.state }/>
        )
    }

}

export default LogComponent
