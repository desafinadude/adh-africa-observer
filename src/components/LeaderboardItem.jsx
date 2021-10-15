import React from 'react';
import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import * as countriesList from '../data/countries.json';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faExclamation, faMinus } from '@fortawesome/free-solid-svg-icons';

import { Sparklines, SparklinesLine } from 'react-sparklines';
import _ from 'lodash';

export class LeaderboardItem extends React.Component {
    constructor() {
        super();
        this.state = {
            scale: [
                {
                    low: -50000,
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
                    high: 50000,
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
            if(Math.round(amount) <= color.high && Math.round(amount) >= color.low) {
                selectedColor = color.color;
            }
        })

        return selectedColor;


    }

    render() {
        return (
            <>
                
                <div className="my-2 cursor-pointer">
                    <Row className="gx-2 align-items-center">
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
                        <Col onClick={() => this.props.onCountrySelect(this.props.country)}>
                            <div className="rounded position-relative" style={{height: '2em', background: '#f6f6f6'}}>
                                <div className="rounded" style={{background: this.getColor(this.props.country.change), width: Math.abs(this.props.country.change) + '%', maxWidth: '100%', height: '100%'}}></div>
                                <div className="position-absolute text-truncate display-block" style={{top: '50%', transform: 'translateY(-50%)', left: '0.5em'}}>{_.filter(countriesList, (o) => { return o.iso_code == this.props.country.iso_code })[0].location}</div>
                            </div>
                        </Col>
                        <Col xs="auto" className="d-grid">
                            <OverlayTrigger
                            placement="left"
                            overlay={(this.props.country.change == null || this.props.country.change == 'NaN') ? <Tooltip>No data available for this day.</Tooltip> : <Tooltip>Percentage change on this day compared to the previous week.</Tooltip>}>
                                <Button style={{background: this.getColor(this.props.country.change), width: '80px', height: '2em'}} className="border-0 badge-inc-dec px-0 py-0">
                                    {(this.props.country.change == null || this.props.country.change == 'NaN') ?
                                        <FontAwesomeIcon icon={ faMinus }/>
                                    :
                                        <>
                                        <FontAwesomeIcon icon={ this.props.country.change > 0 ? faCaretUp : faCaretDown }/>
                                        &nbsp;<span>{ Math.round(this.props.country.change) }%</span>
                                        </>
                                    }
                                </Button>
                            </OverlayTrigger>
                        </Col>
                        <Col xs={2} className="d-none d-lg-block">
                            <OverlayTrigger
                            placement="left"
                            overlay={<Tooltip>New cases over the last 14 days.</Tooltip>}>
                                <div>
                                    <Sparklines data={this.props.country.case_history.replaceAll('nan','0.0').split('|')}>
                                        <SparklinesLine style={{ strokeWidth: 3, stroke: "#094151", fill: "#B3D2DB", fillOpacity: "1" }}/>
                                    </Sparklines>
                                </div>
                            </OverlayTrigger>
                        </Col>
                        <Col xs="auto" className="justify-content-between d-none d-lg-flex">
                            { (this.props.country.data_gaps == 1 || this.props.country.change > 200) ?
                                <OverlayTrigger
                                placement="left"
                                overlay={
                                    <Tooltip>
                                        { this.props.country.change > 200 ? "A change of more than 200% could indicate a delayed data dump and might not reflect the specific day's increase or decrease" : '' }
                                        
                                        {this.props.country.data_gaps == 1 && this.props.country.change > 200 ? '\n\n' : ''}
                                        
                                        {this.props.country.data_gaps == 1 ?
                                         _.filter(this.props.definitions, function(def) { return def.name == 'problematic_data'})[0].text : ''
                                        }
                                    </Tooltip>
                                }>
                                    <Badge bg="control-grey" className="badge-data-alert">
                                        <FontAwesomeIcon icon={faExclamation} />
                                    </Badge>
                                </OverlayTrigger>
                            :
                                <Badge bg="control-grey" className="badge-data-alert" style={{opacity: 0.25}}>
                                    <FontAwesomeIcon icon={faMinus} />
                                </Badge>
                            }
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