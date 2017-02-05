import React from "react";
import RequestTable from "./RequestTable";

var moment = require('moment');

class RequestComponent extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data: [
                {
                    "id": 3,
                    "owner": 2,
                    "status": "outstanding",
                    "item": {
                        "id": 3,
                        "name": "Nexus 5x",
                        "quantity": 5
                    },
                    "item_id": 3,
                    "quantity": 3,
                    "reason": "I would like to sell them on the black market",
                    "timestamp": "2017-02-03T04:42:07.970844Z",
                    "admin_timestamp": "2017-02-03T04:41:57Z",
                    "admin_comment": "",
                    "admin": 1
                }
            ,                {
                    "id": 3,
                    "owner": 2,
                    "status": "outstanding",
                    "item": {
                        "id": 3,
                        "name": "Nexus 5x",
                        "quantity": 5
                    },
                    "item_id": 3,
                    "quantity": 3,
                    "reason": "I would like to sell them on the black market",
                    "timestamp": "2017-02-03T04:42:07.970844Z",
                    "admin_timestamp": "2017-02-03T04:41:57Z",
                    "admin_comment": "",
                    "admin": 1
                }]
        }
    }

    componentWillMount(){
        this.getAllRequests()
    }

    getAllRequests(url_parameter){
        //do get requests and change this.state.data to reps
        var response_results = RequestComponent.editGetResponse(this.state.data);
        this.setState({
            data: response_results
        })
    }

    static editGetResponse(data) {
        for(var index=0; index< data.length; index++){
            data[index]['item_name'] = data[index]['item']['name'];
            data[index]['timestamp'] = moment(data[index].timestamp).format('lll');
        }
        return data;
    }

    render(){
        return(
            <RequestTable ref="requestTable" { ...this.state }/>
        )
    }


}

export default RequestComponent;