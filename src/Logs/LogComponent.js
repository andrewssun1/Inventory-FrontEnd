import React from "react";
import LogTable from "./LogTable";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js"

var moment = require('moment');

class LogComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            action_map: new Map(),
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
          var url = url_parameter == null ? "/api/log/" : "/api/log/" + url_parameter;
          restRequest("GET", url, "application/json", null,
                      (responseText)=>{
                        var response = JSON.parse(responseText);
                        for (var i = 0; i < response.results.length; i++){
                            response.results[i]["action_tag"] = response.results[i].action.tag;
                            response.results[i]["action_color"] = response.results[i].action.color;
                            response.results[i]["action_id"] = response.results[i].action.id;
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

    postRequestForLog(action, description, cb){
        var request = {"action_id": parseInt(this.state.action_map.get(action), 10), "description": description};
        checkAuthAndAdmin(()=>{
          restRequest("POST", "/api/log/", "application/json", request,
                      (responseText)=>{cb(responseText)}, ()=>{console.log('POST Failed!!')})
                  });
    }

    componentWillMount() {
        //Getting all the Logs
        this.getRequestForLog(null, ()=>{
          checkAuthAndAdmin(()=>{
            restRequest("GET", "/api/log/action/", "application/json", null,
                        (responseText)=>{
                          var response = JSON.parse(responseText);
                          // console.log(response)
                          var responseMap = new Map();
                          var actions = [];
                          var action_filters = {};
                          for (var i=0; i<response.results.length; i++){
                              responseMap.set(response.results[i]['tag'], response.results[i]['id']);
                              actions.push(response.results[i]['tag']);
                              action_filters[parseInt(response.results[i]['id'], 10)] = response.results[i]['tag'];
                          }
                          // console.log(action_filters);
                          this.setState({
                              action_map: responseMap,
                              action_list: actions,
                              action_filter_obj: action_filters
                          });
                        }, ()=>{})
                      });
        });
    }

    onAddRow(row) {
        if (row){
                this.postRequestForLog(row['action_tag'], row['description'],
                (json_response)=>{
                  var response = JSON.parse(json_response);
                  response['action_tag'] = response['action']['tag'];
                  var tempData = this.state.data;
                  response.timestamp = moment(response.timestamp).format('lll')
                  tempData.push(response);
                  this.setState({
                      data: tempData
                  });
                });
            }
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
        var filter_url_param = "?action__tag=" + this.state.action_filter_obj[filterObj["action_tag"]["value"]];
        this.getRequestForLog(filter_url_param, ()=>{
          this.setState({
              currentPage:1,
              currentFilterURL: filter_url_param
          });
        });
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
                      onPageChange={ this.onPageChange.bind(this) }
                      onFilterChange={ this.onFilterChange.bind(this) }
                      onAddRow={ this.onAddRow.bind(this) } { ...this.state }/>
        )
    }

}

export default LogComponent
