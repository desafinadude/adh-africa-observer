import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import FlipMove from 'react-flip-move';
import { LeaderboardItem } from './LeaderboardItem';
import _ from 'lodash';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faArrowsAltV } from '@fortawesome/free-solid-svg-icons'


export class Leaderboard extends React.Component {
    constructor() {
        super();
        this.state = {
            limit: 10,
            fullList: false
        }
    }

    componentDidMount() {

        
    }

    componentDidUpdate() {

    }

    toggleList = () => {
        let self = this;

        self.setState({ fullList: !self.state.fullList });

        self.state.limit == 10 ? self.setState({ limit: 56 }) : self.setState({ limit: 10 });
        
    }

   

    render() {
        let self = this;
        return (
            <>
                <Card className="border-0 rounded">
                    <Card.Body>
                        <h5>% Change in new cases per million (7 day average) - Ranked</h5>
                        <hr/>
                        
                        {this.props.playingTimeline == true ?
                            <FlipMove>
                                {self.props.data.map((country,index) => {
                                    if(index < self.state.limit) {
                                        return <LeaderboardItem index={index} key={country.iso_code} country={country} onCountrySelect={self.props.onCountrySelect}/>
                                    }
                                })}
                            </FlipMove>
                        :
                            <>
                                {self.props.data.map((country,index) => {
                                    if(index < self.state.limit) {
                                        return <LeaderboardItem index={index} key={country.iso_code} country={country} onCountrySelect={self.props.onCountrySelect}/>
                                    }
                                })}
                            </>
                        }
                        

                        <Button variant="control-grey" className="w-100 d-flex justify-content-between my-3" onClick={ () => self.toggleList() }>
                            <div>{ self.state.fullList == true ? 'Click to collapse' : 'Click to expand all countries' }</div>
                            <FontAwesomeIcon icon={faArrowsAltV} style={{position: 'relative', top: '4px'}}/>
                        </Button>
                        
                        {this.props.playingTimeline == true ?
                            <>
                                {self.state.fullList == false ? 
                                    (<FlipMove>
                                        {self.props.data.map((country,index) => {
                                            if(index > 44) {
                                                return <LeaderboardItem index={index} key={country.iso_code} country={country} onCountrySelect={self.props.onCountrySelect}/>
                                            }
                                        })}
                                    </FlipMove>) : ''
                                }
                            </>
                        :
                            <>    
                                {self.state.fullList == false ? 
                                    (<>
                                        {self.props.data.map((country,index) => {
                                            if(index > 44) {
                                                return <LeaderboardItem index={index} key={country.iso_code} country={country} onCountrySelect={self.props.onCountrySelect}/>
                                            }
                                        })}
                                    </>) : ''
                                }
                            </>
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
                        <h6 className="mt-3">Understanding the table:</h6>
                        <p className="text-black-50 mt-3">Using data from Our World In Data, the resurgence map uses a 7-day rolling window to measure the percentage change in the number of new confirmed cases in that period relative to the previous 7 days over the course of the pandemic. The table ranks the change from highest increase to highest decrease. The alert badge (!) highlights problematic data.</p>
                    </Card.Body>
                </Card>
                
            </>
        );
    }
}