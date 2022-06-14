import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import FlipMove from 'react-flip-move';
import { LeaderboardItem } from './LeaderboardItem';
import _ from 'lodash';

import * as texts from '../data/texts.json';


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
                        {this.props.playingTimeline == true ?
                            <FlipMove>
                                {self.props.data.map((country,index) => {
                                    if(country.new_cases_smoothed_per_million > 1) {
                                        return <LeaderboardItem index={index} key={country.iso_code} country={country} onCountrySelect={self.props.onCountrySelect}/>
                                    }
                                })}
                            </FlipMove>
                        :
                            <>
                                {self.props.data.map((country,index) => {
                                    if(country.new_cases_smoothed_per_million > 1) {
                                        return <LeaderboardItem index={index} key={country.iso_code} country={country} onCountrySelect={self.props.onCountrySelect}/>
                                    }
                                })}
                            </>
                        }
                       
                        <hr/>
                        <Row className="align-items-center">
                            <Col><span className="text-black-50">Source: <a className="text-black-50" target="_blank" href={_.filter(texts[this.props.api.dataset], function(def) { return def.name == 'source'})[0].link}>{_.filter(texts[this.props.api.dataset], function(def) { return def.name == 'source'})[0].link_text}</a></span></Col>
                        </Row>
                        {/* <div className="d-none d-md-block">
                            <hr/>
                            <h6 className="mt-3">{_.filter(texts[this.props.api.dataset], function(def) { return def.name == 'table_description'})[0].title}</h6>
                            <p className="text-black-50 mt-3">{_.filter(texts[this.props.api.dataset], function(def) { return def.name == 'table_description'})[0].text}</p>
                        </div> */}
                    </Card.Body>
                </Card>
                
            </>
        );
    }
}