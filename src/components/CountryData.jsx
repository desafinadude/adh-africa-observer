import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';

import ReactECharts from 'echarts-for-react';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCaretDown, faCaretUp, faInfo, faExclamation } from '@fortawesome/free-solid-svg-icons';

import * as field_desc from '../data/owid-field-descriptions.json';

export class CountryData extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedCountry: '',
            selectedMetric: '',
            options: {
                grid: { top: 8, right: 40, bottom: 24, left: 40 },
                dataZoom: [
                    {
                        show: true,
                        start: 50,
                        end: 100
                    },
                    {
                        type: 'inside',
                        start: 50,
                        end: 100
                    },
                    
                ],
                xAxis: {
                    data: [],
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '',
                        position: 'left',
                        offset: 0,
                        axisLabel: {
                            formatter: '{value}'
                        }
                    },
                    {
                        type: 'value',
                        name: '',
                        position: 'right',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],
                series: [
                    {
                        data: [],
                        type: 'bar',
                        smooth: true
                    },
                ],
                tooltip: {
                    trigger: 'axis',
                }
            }
        }
    }

    componentDidMount() {
        let self = this;
        self.setState({ selectedCountry: this.props.selectedCountries[0] });
    }

    componentDidUpdate() {

        let self = this;

        if(self.state.selectedCountry.iso_code != this.props.selectedCountries[0].iso_code) {
            self.setState({ selectedCountry: this.props.selectedCountries[0] });
        }

        axios.get('https://adhtest.opencitieslab.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"fc2a18a1-0c76-4afe-8934-2b9a9dacfef4"%20WHERE%20iso_code%20LIKE%20%27' + this.props.selectedCountries[0].iso_code + '%27')
        .then(function(response) {


            let dates = _.map(response.data.result.records,'date');

            let data = _.map(response.data.result.records,'new_cases_per_million');
            let overlay = [];

            let series = [
                {
                    data: data,
                    type: 'bar',
                    smooth: true,
                    itemStyle: {
                        color: '#93ABB2'
                    },
                },
            ];

            if(self.state.selectedMetric != '') {
                overlay = _.map(response.data.result.records, self.state.selectedMetric);
                series.push(
                    {
                        data: overlay,
                        type: 'line',
                        smooth: true,
                        yAxisIndex: 1,
                        itemStyle: {
                            borderWidth: 3,
                            width: 2,
                            color: '#094151'
                        },
                    },
                )
            }

            self.setState({
                options: {
                    grid: { top: 8, right: 8, bottom: 24, left: 36 },
                    xAxis: {
                        type: 'category', 
                        axisLabel: {
                            formatter: (function(value){
                                return value.split('T')[0];
                            })
                        },
                        data: dates,
                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: series,
                }
            })
        })
        

    }

    selectMetric = (e) => {

        this.setState({selectedMetric: e.target.value})

    }



   

    render() {
        let self = this;
        return (
            <>
                <Card className="border-0 rounded">
                    <Card.Body>
                        <Row className="gx-2">
                            <Col xs="auto">
                                <div style={{width: '2em', height: '2em', borderRadius: '50%', overflow: 'hidden', position: 'relative'}} className="border">
                                    {this.state.selectedCountry.iso_code != undefined ?
                                        <ReactCountryFlag
                                        svg
                                        countryCode={getCountryISO2(this.state.selectedCountry.iso_code)}
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
                            <Col className="position-relative">
                                <div className="position-relative top-50 start-50 translate-middle">{this.state.selectedCountry.location}</div>
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
                    </Card.Body>
                </Card>

                <Card className="border-0 rounded mt-5">
                    <Card.Body>
                        <h5>Compare data to new cases per million</h5>
                        <hr/>
                        <Row className="mb-5">
                            <Col xs="auto" className="position-relative"><div className="position-relative top-50 start-50 translate-middle"><strong>Overlay dataset:</strong></div></Col>
                            <Col>
                                <Form.Select className="border-0" style={{backgroundColor: '#F6F6F6'}} onChange={this.selectMetric}>
                                    <option>Add a comparison metric</option>
                                    <option value="hosp_patients">hosp_patients</option>
                                    <option value="hosp_patients_per_million">hosp_patients_per_million</option>
                                    <option value="hospital_beds_per_thousand">hospital_beds_per_thousand</option>
                                    <option value="icu_patients">icu_patients</option>
                                    <option value="icu_patients_per_million">icu_patients_per_million</option>
                                    <option value="new_cases">new_cases</option>
                                    <option value="new_cases_per_million">new_cases_per_million</option>
                                    <option value="new_cases_smoothed">new_cases_smoothed</option>
                                    <option value="new_cases_smoothed_per_million">new_cases_smoothed_per_million</option>
                                    <option value="new_deaths">new_deaths</option>
                                    <option value="new_deaths_per_million">new_deaths_per_million</option>
                                    <option value="new_deaths_smoothed">new_deaths_smoothed</option>
                                    <option value="new_deaths_smoothed_per_million">new_deaths_smoothed_per_million</option>
                                    <option value="new_tests">new_tests</option>
                                    <option value="new_tests_per_thousand">new_tests_per_thousand</option>
                                    <option value="new_tests_smoothed">new_tests_smoothed</option>
                                    <option value="new_tests_smoothed_per_thousand">new_tests_smoothed_per_thousand</option>
                                    <option value="new_vaccinations">new_vaccinations</option>
                                    <option value="new_vaccinations_smoothed">new_vaccinations_smoothed</option>
                                    <option value="new_vaccinations_smoothed_per_million">new_vaccinations_smoothed_per_million</option>
                                    <option value="people_fully_vaccinated">people_fully_vaccinated</option>
                                    <option value="people_fully_vaccinated_per_hundred">people_fully_vaccinated_per_hundred</option>
                                    <option value="people_vaccinated">people_vaccinated</option>
                                    <option value="people_vaccinated_per_hundred">people_vaccinated_per_hundred</option>
                                    <option value="positive_rate">positive_rate</option>
                                    <option value="reproduction_rate">reproduction_rate</option>
                                    <option value="stringency_index">stringency_index</option>
                                    <option value="tests_per_case">tests_per_case</option>
                                    <option value="tests_units">tests_units</option>
                                    <option value="total_cases">total_cases</option>
                                    <option value="total_cases_per_million">total_cases_per_million</option>
                                    <option value="total_deaths">total_deaths</option>
                                    <option value="total_deaths_per_million">total_deaths_per_million</option>
                                    <option value="total_tests">total_tests</option>
                                    <option value="total_tests_per_thousand">total_tests_per_thousand</option>
                                    <option value="total_vaccinations">total_vaccinations</option>
                                    <option value="total_vaccinations_per_hundred">total_vaccinations_per_hundred</option>
                                    <option value="weekly_hosp_admissions">weekly_hosp_admissions</option>
                                    <option value="weekly_hosp_admissions_per_million">weekly_hosp_admissions_per_million</option>
                                    <option value="weekly_icu_admissions">weekly_icu_admissions</option>
                                    <option value="weekly_icu_admissions_per_million">weekly_icu_admissions_per_million</option>
                                </Form.Select>   
                            </Col>
                        </Row>
                        <ReactECharts option={this.state.options} />
                            <hr/>
                            { this.state.selectedMetric != '' ?
                                <>
                                    <h6>What is "{_.filter(field_desc,(o) => { return o.column == this.state.selectedMetric; })[0].column }" ?</h6>
                                    <p className="text-black-50 mt-4">{_.filter(field_desc,(o) => { return o.column == this.state.selectedMetric; })[0].description }</p>
                                    <hr/>
                                    <Row className="align-items-center">
                                        <Col><span className="text-black-50">Source: {_.filter(field_desc,(o) => { return o.column == this.state.selectedMetric; })[0].source }</span></Col>
                                    </Row>
                                </>
                                : 
                                <>
                                    <h6>What is "new_cases_per_million" ?</h6>
                                    <p className="text-black-50 mt-4">{_.filter(field_desc,(o) => { return o.column == 'new_cases_per_million'; })[0].description }</p>
                                    <hr/>
                                    <Row className="align-items-center">
                                        <Col><span className="text-black-50">Source: {_.filter(field_desc,(o) => { return o.column == 'new_cases_per_million'; })[0].source }</span></Col>
                                    </Row>
                                </>
                            }
                    </Card.Body>
                </Card>


            </>
        );
    }
}