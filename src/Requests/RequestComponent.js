import React from "react";
import RequestTable from "./RequestTable";


class RequestComponent extends React.Component {

    render() {
      return (
        <div>
        <RequestTable ref="requestTable"/>
        </div>
      )
    }

}

export default RequestComponent;
