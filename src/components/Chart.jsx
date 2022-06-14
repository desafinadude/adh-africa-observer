import React from 'react';
import * as d3 from 'd3';


export class Chart extends React.Component {
    constructor() {
        super();
        this.state = {
            container: null
        }
    }

    componentDidMount() {

    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        // if(this.props.a != prevProps.a || this.props.b.length != prevProps.b.length) {
        //     return true;
        // } else {
        //     return null;
        // }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // if (snapshot == true) {
        //     this.showData();
        // }
    }

    showData = () => {

    }

    render() {
        return <svg id="Chart"></svg>
    }

}
    