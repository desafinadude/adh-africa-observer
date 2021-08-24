import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

// import FlipMove from 'react-flip-move';
import { LeaderboardItem } from './LeaderboardItem';
import _ from 'lodash';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faArrowsAltV } from '@fortawesome/free-solid-svg-icons'

import * as countriesList from '../data/countries.json'


export class Leaderboard extends React.Component {
    constructor() {
        super();
        this.state = {
            limit: 10,
            fullList: false
        }
    }

    componentDidMount() {

        // let countriesData = []

        // _.forEach(countriesList, (country) => {
        //     countriesData.push(
        //         {
        //             location: country.location,
        //             iso_code: country.iso_code,
        //             change: Math.ceil(Math.random() * 100) * (Math.round(Math.random()) ? 1 : -1)
        //         }
        //     )
        // })

        // this.setState({countriesData: _.orderBy(countriesData, ['change', 'desc'])});

    }

    componentDidUpdate() {

        // console.log(this.props.data);
    }

    toggleList = () => {
        let self = this;

        self.setState({ fullList: !self.state.fullList });

        self.state.limit == 10 ? self.setState({ limit: 56 }) : self.setState({ limit: 10 });
        
    }

  

    shuffle = () => {

        // let countriesData = []

        // _.forEach(countriesList, (country) => {
        //     countriesData.push(
        //         {
        //             location: country.location,
        //             iso_code: country.iso_code,
        //             change: Math.ceil(Math.random() * 100) * (Math.round(Math.random()) ? 1 : -1)
        //         }
        //     )
        // })

        // this.setState({countriesData: _.orderBy(countriesData, ['change','desc'])});
    }

    render() {
        let self = this;
        return (
            <>
                <Card className="border-0 rounded">
                    <Card.Body>
                        <Row>
                            <Col><h5>New cases per million (7 day average)</h5></Col>
                            {/* <Col xs="auto">
                                <Button size="sm" onClick={self.shuffle} variant="control-grey">
                                    <FontAwesomeIcon icon={faInfo} />
                                </Button>
                            </Col> */}
                        </Row>
                        <hr/>
                        
                            {self.props.data.map((country,index) => {
                                if(index < self.state.limit) {
                                    return <LeaderboardItem direction="increasing" index={index} key={country.iso_code} country={country} />
                                }
                            })}
                        

                        <Button variant="control-grey" className="w-100 d-flex justify-content-between my-3" onClick={self.toggleList}>
                            <div>{ self.state.fullList == true ? 'Click to collapse' : 'Click to expand all countries' }</div>
                            <FontAwesomeIcon icon={faArrowsAltV} style={{position: 'relative', top: '4px'}}/>
                        </Button>
                        
                        {self.state.fullList == false ? 
                            (<>
                                {self.props.data.map((country,index) => {
                                    if(index > 44) {
                                        return <LeaderboardItem direction="increasing" index={index} key={country.iso_code} country={country} />
                                    }
                                })}
                            </>) : ''
                        }
                        <hr/>
                        <Row className="align-items-center">
                            <Col><span className="text-black-50">Source: <a className="text-black-50" target="_blank" href="https://www.ourworldindata.com">www.ourworldindata.com</a></span></Col>
                            {/* <Col xs="auto">
                                <Button variant="control-grey">Embed</Button>&nbsp;&nbsp;
                                <Button variant="control-grey">Download Data</Button>
                            </Col> */}
                        </Row>
                        <hr/>
                        <h6>Understanding the table:</h6>
                        <p className="text-black-50 mt-4">Using data from Our World In Data, the resurgence map uses a 7-day rolling window to measure the percentage change in the number of new confirmed cases in that period relative to the previous 7 days over the course of the pandemic. The table ranks the change from highest increase to highest decrease. The alert badge (!) highlights problematic data.</p>
                    </Card.Body>
                </Card>
                
            </>
        );
    }
}