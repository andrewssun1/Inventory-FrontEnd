import React from "react";
import RequestTable from "./RequestTable";
import RequestButton from "./RequestButton";
import {hashHistory} from "react-router";

var moment = require('moment');
var xhttp = new XMLHttpRequest();

class RequestComponent extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data: [],
            totalDataSize: 0,
            __loginState: true,
            currentFilterURL: null,
            currentSearchURL: null,
            currentPage: 1,
            unselectable: [],
            selected: []
        }
    }

    componentWillMount(){
        this.getAllRequests(null)
    }

    getAllRequests(url_parameter){
        var url = url_parameter == null ? "https://asap-test.colab.duke.edu/api/request/" : "https://asap-test.colab.duke.edu/api/request/" + url_parameter;
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
            var unselectable_ids = [];
            var response_results = RequestComponent.editGetResponse(response.results, unselectable_ids);
            this.setState({
                data: response_results,
                totalDataSize: response.count,
                unselectable: unselectable_ids
            });
        }
    }

    static editGetResponse(data,unselectable_arr) {
        for(var index=0; index< data.length; index++){
            data[index]['item_name'] = data[index]['item'] == null ? 'UNKNOWN ITEM' : data[index]['item']['name'];
            data[index]['timestamp'] = moment(data[index].timestamp).format('lll');
            if(data[index]['status']!=='outstanding'){
                unselectable_arr.push(data[index]['id'])
            }
        }
        return data;
    }

    onPageChange(page, sizePerPage) {
        var page_argument = "page=" + page;
        var url_param = this.state.currentFilterURL == null ? "?" + page_argument : this.state.currentFilterURL + "&" + page_argument;
        url_param = this.state.currentSearchURL == null ? url_param : url_param + this.state.currentFilterURL + "&" + page_argument;
        this.getRequestForLog(url_param);
        this.setState({
            currentPage: page
        })
    }

    onRowSelect(row, isSelected, e) {
        var selected_ids = this.state.selected;
        if(isSelected){
            selected_ids.push(row.id)
        }
        else{
            var index = selected_ids.indexOf(row.id);
            if (index > -1) {
                selected_ids.splice(index, 1);
            }
        }
        this.setState({
            selected: selected_ids
        })
    }

    onSelectAll(isSelected, rows) {
        if(isSelected){
            var selected_ids = rows.map(row => row.id);
            this.setState({
                selected: selected_ids
            })
        }
        else{
            this.setState({
                selected: []
            })
        }
    }

    render(){
        const options = {
            onPageChange: this.onPageChange.bind(this),
            sizePerPageList: [ 30 ],
            sizePerPage: 30,
            page: this.state.currentPage,
        };

        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            unselectable: this.state.unselectable,
            onSelect: this.onRowSelect.bind(this),
            onSelectAll: this.onSelectAll.bind(this)
        };

        return(
            <div>
                <RequestButton ref="requestButton" { ...this.state}/>
                <RequestTable ref="requestTable" selectRowProp={selectRowProp} options={options}{ ...this.state }/>
            </div>
        )
    }


}

export default RequestComponent;