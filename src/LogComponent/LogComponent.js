import React from "react";
import LogTable from "./LogTable";
import {hashHistory} from "react-router";


var xhttp = new XMLHttpRequest();
var moment = require('moment');

class LogComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            action_map: new Map(),
            action_list: [],
            action_filter_obj: {},
            _loginState: true
        };
    }

    getRequestForLog(url_parameter){
        var url = url_parameter == null ? "https://asap-test.colab.duke.edu/api/log/" : "https://asap-test.colab.duke.edu/api/log/" + url_parameter;
        xhttp.open("GET", url, false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        xhttp.send();
        if (xhttp.status === 401 || xhttp.status === 500){
            if(!!localStorage.token){
                delete localStorage.token;
            }
            this.setState({
                _loginState: false
            });
            hashHistory.push('/login');
            return null;
        }
        else{
            var response = JSON.parse(xhttp.responseText);
            for (var i = 0; i < response.results.length; i++){
                response.results[i]["action_tag"] = response.results[i].action.tag;
                response.results[i]["action_color"] = response.results[i].action.color;
                response.results[i]["action_id"] = response.results[i].action.id;
                response.results[i].timestamp = moment(response.results[i].timestamp).format('lll')
            }
            this.setState({
                data: response.results
            });
        }
    }

    postRequestForLog(action, description){
        xhttp.open("POST", "https://asap-test.colab.duke.edu/api/log/", false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        var request = {"action_id": parseInt(this.state.action_map.get(action)), "description": description};
        xhttp.send(JSON.stringify(request));
        if (xhttp.status === 401 || xhttp.status === 500){
            console.log('POST Failed!!');
        }
        return xhttp.responseText
    }

    componentWillMount() {
        //Getting all the Logs
        this.getRequestForLog(null);

        //Getting all the actions
        xhttp.open("GET", "https://asap-test.colab.duke.edu/api/log/action/", false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        xhttp.send();
        if (xhttp.status === 401 || xhttp.status === 500){
            if(!!localStorage.token){
                delete localStorage.token;
            }
            this.setState({
                _loginState: false
            });
            hashHistory.push('/login');
            return null;
        }
        else{
            var response = JSON.parse(xhttp.responseText);
            console.log(response)
            var responseMap = new Map();
            var actions = [];
            var action_filters = {};
            for (var i=0; i<response.results.length; i++){
                responseMap.set(response.results[i]['tag'], response.results[i]['id']);
                actions.push(response.results[i]['tag']);
                action_filters[parseInt(response.results[i]['id'])] = response.results[i]['tag'];
            }
            console.log(action_filters);
            this.setState({
                action_map: responseMap,
                action_list: actions,
                action_filter_obj: action_filters
            });
        }
    }

    onAddRow(row) {
        if (row){
                var json_response = this.postRequestForLog(row['action_tag'], row['description']);
                var response = JSON.parse(json_response);
                response['action_tag'] = response['action']['tag'];
                var tempData = this.state.data;
                tempData.push(response);
                this.setState({
                    data: tempData
                });
            }
        }

    onFilterChange(filterObj) {
        if (Object.keys(filterObj).length === 0) {
            this.getRequestForLog(null);
            return;
        }
        var action__tag = this.state.action_filter_obj[filterObj["action_tag"]["value"]];
        this.getRequestForLog("?action__tag=" + action__tag)
    }

    render(){
        return(
            <LogTable ref="logTable" onFilterChange={ this.onFilterChange.bind(this) } onAddRow={ this.onAddRow.bind(this) } { ...this.state }/>
        )
    }

}

export default LogComponent