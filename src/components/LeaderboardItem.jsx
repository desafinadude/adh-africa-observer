import React from 'react';
import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import * as countriesList from '../data/countries.json';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCaretDown, faCaretUp, faInfo, faExclamation } from '@fortawesome/free-solid-svg-icons'

import { Sparklines, SparklinesLine } from 'react-sparklines';
import _ from 'lodash';

export class LeaderboardItem extends React.Component {
    constructor() {
        super();
        this.state = {
            scale: [
                {
                    low: -100,
                    high: -51,
                    color: '#2E9FF1'
                },
                {
                    low: -50,
                    high: -26,
                    color: '#70C3FF'
                },
                {
                    low: -25,
                    high: -11,
                    color: '#9DD6FF'
                },
                {
                    low: -10,
                    high: 0,
                    color: '#E0F2FF'
                },
                {
                    low: 0,
                    high: 10,
                    color: '#FFECEC'
                },
                {
                    low: 11,
                    high: 25,
                    color: '#FFD1D1'
                },
                {
                    low: 26,
                    high: 50,
                    color: '#FFB7B7'
                },
                {
                    low: 50,
                    high: 100,
                    color: '#FF8585'
                },
                {
                    low: 101,
                    high: 5000,
                    color: '#FF5454'
                },
            ]
        }
    }

    componentDidMount() {
        

    }

    componentDidUpdate() {
    }

    getColor = (amount) => {
        let self = this;
        let selectedColor = '';

        _.forEach(self.state.scale, function(color) {
            if(amount <= color.high && amount >= color.low) {
                selectedColor = color.color;
            }
        })

        return selectedColor;


    }

    render() {
        return (
            <>
                
                <div className="my-2">
                    <Row className="gx-2"> {/*  className={this.props.index > 9 && this.props.index < 45 ? 'visually-hidden' : ''} */}
                        <Col xs="auto">
                            <div style={{width: '20px'}}>{this.props.index + 1}.</div>
                        </Col>
                        <Col xs="auto">
                            <div style={{width: '2em', height: '2em', borderRadius: '50%', overflow: 'hidden', position: 'relative'}} className="border">
                                <ReactCountryFlag
                                svg
                                countryCode={getCountryISO2(this.props.country.iso_code)}
                                style={{
                                    position: 'absolute', 
                                    top: '30%',
                                    left: '30%',
                                    marginTop: '-50%',
                                    marginLeft: '-50%',
                                    fontSize: '2.8em',
                                    lineHeight: '2.8em',
                                }}/>
                            </div>
                        </Col>
                        <Col>
                            <div className="rounded position-relative" style={{height: '2em', background: '#f6f6f6'}}>
                                <div className="rounded" style={{background: this.getColor(this.props.country.change), width: Math.abs(this.props.country.change) + '%', maxWidth: '100%', height: '100%'}}></div>
                                <div className="position-absolute text-truncate" style={{top: '50%', transform: 'translateY(-50%)', left: '0.5em'}}>{_.filter(countriesList, (o) => { return o.iso_code == this.props.country.iso_code })[0].location}</div>
                            </div>
                        </Col>
                        <Col xs="auto" className="d-grid">
                            <Button style={{background: this.getColor(this.props.country.change), width: '80px'}} className="border-0 badge-inc-dec px-0 py-0">
                                <FontAwesomeIcon icon={ this.props.country.change > 0 ? faCaretUp : faCaretDown }/>
                                &nbsp;<span>{ Math.abs(this.props.country.change).toFixed(2) }%</span>
                            </Button>
                        </Col>
                        <Col xs={2}>
                            <Sparklines data={[5, 10, 5, 20, 8, 15]}><SparklinesLine /></Sparklines>
                        </Col>
                        <Col xs="auto" className="justify-content-between d-none d-lg-flex">
                            <Badge bg="control-grey" className="badge-data-alert">
                                <FontAwesomeIcon icon={faExclamation} />
                            </Badge>
                            {/* <Badge bg="control-grey" className="badge-data-alert">
                                <FontAwesomeIcon icon={faInfo} />
                            </Badge>
                            <Badge bg="control-grey" className="badge-data-alert">
                                <FontAwesomeIcon icon={faInfo} />
                            </Badge>
                            <Badge bg="control-grey" className="badge-data-alert">
                                <FontAwesomeIcon icon={faInfo} />
                            </Badge>
                            <Badge bg="control-grey" className="badge-data-alert">
                                <FontAwesomeIcon icon={faInfo} />
                            </Badge>
                            <Badge bg="control-grey" className="badge-data-alert">
                                <FontAwesomeIcon icon={faInfo} />
                            </Badge> */}
                        </Col>
                    </Row>
                </div>
                
            </>
           
        );
    }
}