import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import FlipMove from 'react-flip-move';
import { LeaderboardItem } from './LeaderboardItem';
import _ from 'lodash';

import * as settings from '../data/settings.json';


export class Leaderboard extends React.Component {
    constructor() {
        super();
        this.state = {
            
        }
    }

    componentDidMount() {

        
    }


    toggleList = () => {
        let self = this;

        
    }

   

    render() {
        let self = this;
        return (
            <>
                <Card className="border-0 rounded">
                    <Card.Body>

                        {this.props.playingTimeline == true ?
                            <FlipMove>
                                {self.props.data.map((country,index) => {
                                    if(!isNaN(country[this.props.selectedBaseMetric])) {
                                        return <LeaderboardItem index={index} key={country.iso_code} country={country} onCountrySelect={self.props.onCountrySelect} selectedBaseMetric={this.props.selectedBaseMetric}/>
                                    }
                                })}
                            </FlipMove>
                        :
                            <>
                                {self.props.data.map((country,index) => {
                                    if(!isNaN(country[this.props.selectedBaseMetric])) {
                                        return <LeaderboardItem index={index} key={country.iso_code} country={country} onCountrySelect={self.props.onCountrySelect} selectedBaseMetric={this.props.selectedBaseMetric}/>
                                    }
                                })}
                            </>

                        }
                       
                        <hr/>
                        <Row className="align-items-center">
                            <Col><span className="text-black-50">Source: <a className="text-black-50" target="_blank" href={_.filter(settings.texts, function(def) { return def.name == 'source'})[0].link}>{_.filter(settings.texts, function(def) { return def.name == 'source'})[0].link_text}</a></span></Col>
                        </Row>
                    </Card.Body>
                </Card>
                
            </>
        );
    }
}