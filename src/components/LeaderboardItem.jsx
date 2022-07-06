import React from 'react';
import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import * as countriesList from '../data/countries.json';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { Sparklines, SparklinesLine } from 'react-sparklines';
import _ from 'lodash';

import { CaseGradient } from '../utils/Gradient';

export class LeaderboardItem extends React.Component {

    checkLocation = (country) => {
        let location = '';
        let check_location = _.filter(countriesList, (o) => { return o.iso_code == this.props.country.iso_code });
        
        if(check_location.length > 0) {
            location = check_location[0].location;
        }

        return location;
    }

    render() {
        return (
            <>
                
                <div className="my-2 cursor-pointer">
                    <Row className="gx-2 align-items-center">
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
                                <div className="rounded" style={{background: '#E4EAEB', width: '100%', height: '100%'}}></div>
                                <div className="position-absolute text-truncate display-block" style={{top: '50%', transform: 'translateY(-50%)', left: '0.5em'}}>
                                    {
                                        this.checkLocation(this.props.country)
                                    }
                                </div>
                            </div>
                        </Col>
                        <Col xs="auto" className="d-grid">
                            <OverlayTrigger
                            placement="left"
                            overlay={<Tooltip>{this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'New Cases Smoothed Per Million' : 'New Cases Smoothed'}</Tooltip>}>
                                <Button style={{background: CaseGradient(this.props.country[this.props.selectedBaseMetric], this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 250 : 2500), width: '80px', height: '2em'}} className="border-0 badge-inc-dec px-0 py-0">
                                    { Math.round(this.props.country[this.props.selectedBaseMetric]) }
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
                       
                    </Row>
                </div>
            </>
        );
    }
}