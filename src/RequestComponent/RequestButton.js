import React from "react";

class RequestButton extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        return(
            <div>
                <button>Approve</button>
                <button>Deny</button>
            </div>
        )
    }
}

export default RequestButton;