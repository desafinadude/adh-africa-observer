import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
// import Tooltip from 'react-bootstrap/Tooltip';


import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFileDownload } from '@fortawesome/free-solid-svg-icons';

import * as definitions from '../data/definitions.json';
import * as texts from '../data/texts.json';


export class CountryData extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedCountry: '',
            selectedMetric: '',
            data: undefined,
            loading: true,
            hoverValue: null
        }
    }

    componentDidMount() {
        let self = this;

        axios.get(this.props.api.url[this.props.api.env] + 'action/datastore_search_sql?sql=SELECT%20*%20from%20"' + this.props.api.data[this.props.api.dataset][this.props.api.env].countryData + '"%20WHERE%20iso_code%20LIKE%20%27' + this.props.selectedCountry[0].iso_code + '%27',
            { headers: {
                "Authorization": process.env.REACT_API_KEY
            }
        })
        .then(function(response) {
            
            let records = _.sortBy(response.data.result.records, ['date']);

            // let records_no_nulls = [];
                
            // _.forEach(records, function(record, index) {
            //     if(record.new_cases_smoothed == 'NaN') {
            //         record.new_cases_smoothed = 0;
            //     }
            //     records_no_nulls.push(record);
            // })

            self.setState({
                data: records,
                loading: false
            });

            
        })

    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if(this.props.selectedCountry[0].iso_code != prevProps.selectedCountry[0].iso_code ||
            this.state.selectedMetric != prevState.selectedMetric ) {
            return true;
         } else {
            return null;
         }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        let self = this;

        if(snapshot == true) {

            axios.get(this.props.api.url[this.props.api.env] + 'action/datastore_search_sql?sql=SELECT%20*%20from%20"' + this.props.api.data[this.props.api.dataset][this.props.api.env].countryData + '"%20WHERE%20iso_code%20LIKE%20%27' + this.props.selectedCountry[0].iso_code + '%27',
                { headers: {
                    "Authorization": process.env.REACT_API_KEY
                }
            })
            .then(function(response) {

                let records = _.sortBy(response.data.result.records, ['date']);
                
                // let records_no_nulls = [];
                
                // _.forEach(records, function(record, index) {
                //     if(record.new_cases_smoothed == 'NaN') {
                //         record.new_cases_smoothed = 0;
                //     }
                //     records_no_nulls.push(record);
                // })

                self.setState({
                    data: records,
                    loading: false
                });

            })

        }
        
    }

   

    selectMetric = (e) => {
        this.setState({selectedMetric: e.target.value})
    }

    

    render() {
        let self = this;
        let val = null;
        return (
            <>
                <Card className={ window.innerWidth < 800 ? 'mt-5 border-0 rounded' : 'border-0 rounded' }>
                    <Card.Body>
                        <Row className="gx-2 align-items-center">
                            <Col xs="auto">
                                <Button variant="light-grey" style={{color: "#094151"}} onClick={() => self.props.onDeselectCountry() }><FontAwesomeIcon icon={faArrowLeft} />&nbsp;Back</Button>
                            </Col>
                            <Col xs="auto">
                                <div style={{width: '2em', height: '2em', borderRadius: '50%', overflow: 'hidden', position: 'relative'}} className="border">
                                    {this.props.selectedCountry[0].iso_code != undefined ?
                                        <ReactCountryFlag
                                        svg
                                        countryCode={getCountryISO2(this.props.selectedCountry[0].iso_code)}
                                        style={{
                                            position: 'absolute', 
                                            top: '30%',
                                            left: '30%',
                                            marginTop: '-50%',
                                            marginLeft: '-50%',
                                            fontSize: '2.8em',
                                            lineHeight: '2.8em',
                                        }}/> : ''
                                    }
                                </div>
                            </Col>
                            <Col>
                                <div>{this.props.selectedCountry[0].location}</div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 rounded mt-4">
                    <Card.Body>
                        <Row className="justify-content-between">
                            <Col xs={12} md="auto" className="pt-2"><h5 className={window.innerWidth < 800 ? 'text-center my-3' : 'my-0 d-inline'}>Compare data to {this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'New Cases Per Million (Smoothed)' : 'New Cases (Smoothed)' }</h5></Col>
                            <Col></Col>
                            <Col md="auto">
                                <Button className="me-1" size="md" variant={this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'primary' : 'control-grey'} onClick={() => this.props.selectBaseMetric() }>{this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'HIDE' : 'SHOW' } PER MILLION</Button>
                            </Col>
                            <Col xs={12} md="auto" className={window.innerWidth < 800 ? 'text-center my-3' : 'my-0'}>
                                
                                <Button onClick={() => this.downloadChart()} variant="light-grey" style={{color: "#094151"}}><FontAwesomeIcon icon={faFileDownload} />&nbsp;Download Image</Button>
                                
                            </Col>
                        </Row>
                        
                        <hr/>
                        <Row className="mb-5">
                            <Col xs="auto" className="position-relative"><div className="position-relative top-50 start-50 translate-middle"><strong>Overlay dataset:</strong></div></Col>
                            <Col xs="auto">
                                <Form.Select className="border-0" style={{backgroundColor: '#F6F6F6'}} onChange={this.selectMetric}>
                                    <option value="">{this.state.selectedMetric == '' ? 'Add a comparison metric' : 'Remove comparison metric'}</option>

                                    {/* OWID */}
                                    { this.props.api.dataset != 'acdc' ?
                                    <>
                                        <option value="new_cases">Confirmed Cases: New Cases</option>
                                        <option value="new_cases_smoothed">Confirmed Cases: New Cases Smoothed</option>
                                        <option value="new_cases_smoothed_per_million">Confirmed Cases: New Cases Smoothed Per Million</option>
                                        <option value="total_cases">Confirmed Cases: Total Cases</option>
                                        <option value="total_cases_per_million">Confirmed Cases: Total Cases Per Million</option>

                                        <option value="new_deaths">Confirmed Deaths: New Deaths</option>
                                        {/* <option value="new_deaths_smoothed">Confirmed Deaths: New Deaths Smoothed</option> */}
                                        <option value="new_deaths_smoothed_per_million">Confirmed Deaths: New Deaths Smoothed Per Million</option>
                                        <option value="total_deaths">Confirmed Deaths: Total Deaths</option>
                                        <option value="total_deaths_per_million">Confirmed Deaths: Total Deaths Per Million</option>

                                        <option value="reproduction_rate">Policy responses: Reproduction Rate</option>
                                        <option value="stringency_index">Policy responses: Stringency Index</option>

                                        <option value="new_tests">Tests &amp; Positivity: New Tests</option>
                                        <option value="new_tests_smoothed">Tests &amp; Positivity: New Tests Smoothed</option>
                                        <option value="total_tests">Tests &amp; Positivity: Total Tests</option>
                                        <option value="positive_rate">Tests &amp; Positivity: Positive Rate</option>

                                        <option value="new_vaccinations">Vaccinations: New Vaccinations</option>
                                        {/* <option value="new_vaccinations_smoothed">Vaccinations: New Vaccinations Smoothed</option> */}
                                        <option value="new_vaccinations_smoothed_per_million">Vaccinations: New Vaccinations Smoothed Per Million</option>
                                        <option value="people_fully_vaccinated">Vaccinations: People Fully Vaccinated</option>
                                        <option value="people_vaccinated">Vaccinations: People Vaccinated</option>
                                        <option value="total_vaccinations">Vaccinations: Total Vaccinations</option>

                                        {/* <option value="tests_per_case">Tests Per Case</option> */}
                                        {/* <option value="new_deaths_per_million">New Deaths Per Million</option> */}
                                        {/* <option value="new_tests_per_thousand">New Tests Per Thousand</option> */}
                                        {/* <option value="new_tests_smoothed_per_thousand">New Tests Smoothed Per Thousand</option> */}
                                        {/* <option value="total_tests_per_thousand">Total Tests Per Thousand</option> */}
                                        {/* <option value="hosp_patients">hosp_patients</option> */}
                                        {/* <option value="hosp_patients_per_million">hosp_patients_per_million</option> */}
                                        {/* <option value="hospital_beds_per_thousand">hospital_beds_per_thousand</option> */}
                                        {/* <option value="icu_patients">icu_patients</option> */}
                                        {/* <option value="icu_patients_per_million">icu_patients_per_million</option> */}
                                        {/* <option value="people_fully_vaccinated_per_hundred">people_fully_vaccinated_per_hundred</option> */}
                                        {/* <option value="people_vaccinated_per_hundred">people_vaccinated_per_hundred</option> */}
                                        {/* <option value="tests_units">tests_units</option> */}
                                        {/* <option value="total_vaccinations_per_hundred">total_vaccinations_per_hundred</option> */}
                                        {/* <option value="weekly_hosp_admissions">weekly_hosp_admissions</option> */}
                                        {/* <option value="weekly_hosp_admissions_per_million">weekly_hosp_admissions_per_million</option> */}
                                        {/* <option value="weekly_icu_admissions">weekly_icu_admissions</option> */}
                                        {/* <option value="weekly_icu_admissions_per_million">weekly_icu_admissions_per_million</option> */}
                                    </> : 
                                    <>
                                        <option value="new_cases">Confirmed Cases: New Cases</option>
                                        <option value="new_cases_smoothed">Confirmed Cases: New Cases Smoothed</option>
                                        <option value="new_cases_per_million">Confirmed Cases: New Cases Per Million</option>
                                        <option value="new_cases_smoothed_per_million">Confirmed Cases: New Cases Smoothed Per Million</option>
                                        <option value="total_cases">Confirmed Cases: Total Cases</option>
                                        <option value="total_cases_per_million">Confirmed Cases: Total Cases Per Million</option>

                                        <option value="new_deaths">Confirmed Deaths: New Deaths</option>
                                        <option value="new_deaths_smoothed">Confirmed Deaths: New Deaths Smoothed</option>
                                        <option value="new_deaths_per_million">Confirmed Deaths: New Deaths Per Million</option>
                                        <option value="new_deaths_smoothed_per_million">Confirmed Deaths: New Deaths Smoothed Per Million</option>
                                        <option value="total_deaths">Confirmed Deaths: Total Deaths</option>
                                        <option value="total_deaths_per_million">Confirmed Deaths: Total Deaths Per Million</option>

                                        <option value="new_vaccinations">Vaccinations: New Vaccinations</option>
                                        <option value="new_people_vaccinated_smoothed">Vaccinations: New People Vaccinated Per Million</option>
                                        <option value="new_people_vaccinated_smoothed_per_hundred">Vaccinations: New People Vaccinated Smoothed Per Million</option>
                                        <option value="total_boosters">Vaccinations: Total Boosters</option>
                                        <option value="total_boosters_per_hundred">Vaccinations: Total Boosters Per Hundred</option>

                                        <option value="new_tests">Tests &amp; Positivity: New Tests</option>
                                        <option value="new_tests_smoothed">Tests &amp; Positivity: New Tests Smoothed</option>
                                        <option value="new_tests_per_thousand">Tests &amp; Positivity: New Tests per Thousand</option>
                                        <option value="new_tests_smoothed_per_thousand">Tests &amp; Positivity: New Tests per Smoothed Thousand</option>

                                        <option value="total_tests">Tests &amp; Positivity: Total Tests</option>
                                        <option value="total_tests_per_thousand">Tests &amp; Positivity: Total Tests per Thousand</option>
                                        <option value="positive_rate">Tests &amp; Positivity: Positive Rate</option>
                                    </> }

                                </Form.Select>   
                            </Col>
                        </Row>

                        <hr/>
                        
                        { this.state.selectedMetric != '' ?
                            <>


                                <h6 className="mt-3">What is "{_.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.state.selectedMetric})[0].name.replaceAll('_',' ') }" ?</h6>
                                <p className="text-black-50 mt-3">{ _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.state.selectedMetric})[0].owid_definition }</p>
                                <hr/>
                                <Row className="align-items-center">
                                    <Col><span className="text-black-50">Source: { _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.state.selectedMetric})[0].source }</span></Col>
                                </Row>
                                <hr/>
                                <h6 className="mt-3">About this data:</h6>
                                <p className="text-black-50 mt-3">{ _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.state.selectedMetric})[0].text }</p>
                            </>
                            : 
                            <>
                                <h6 className="mt-3">What is {self.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'New Cases Per Million (Smoothed)' : 'New Cases (Smoothed)'} ?</h6>
                                <p className="text-black-50 mt-3">{ _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.props.selectedBaseMetric})[0].owid_definition }</p>
                                <hr/>
                                <Row className="align-items-center">
                                    <Col><span className="text-black-50">Source: { _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.props.selectedBaseMetric})[0].source }</span></Col>
                                </Row>
                                <hr/>
                                <h6 className="mt-3">About this data</h6>
                                <p className="text-black-50 mt-3">{ _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.props.selectedBaseMetric})[0].text }</p>
                            </>
                        }
                       
                        
                        
                    </Card.Body>
                </Card>


            </>
        );
    }
}