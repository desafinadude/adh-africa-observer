import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import ReactECharts from 'echarts-for-react';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import * as field_desc from '../data/owid-field-descriptions.json';

export class CountryData extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedCountry: '',
            selectedMetric: '',
            options: {
                grid: { top:20, bottom: 80, left: 60, right: 60},
                dataZoom: [
                    {
                        type: 'slider',
                        xAxisIndex: [0],
                        show: true,
                        start: 0,
                        end: 100,
                        bottom: 10,
                        labelFormatter: function (value, valueStr) {
                            return valueStr.split('T')[0];
                        }
                    },
                  
                    
                ],
                xAxis: {
                    offset: 10,
                    axisLabel: {
                        formatter: '{MMM} {yy}'
                    },
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
                            formatter: (function(value){
                                let val = '';
                                if(value >= 1000000) {
                                    val = value / 1000000 + 'm';
                                } else if(value >= 1000) {
                                    val = value / 1000 + 'k';
                                } else {
                                    val = value;
                                } 


                                return val;
                            })
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
                    formatter: function (params) {
                        let label = '<strong>' + params[0].axisValue.split('T')[0] + '</strong><hr/>';
                        _.forEach(params, function(param) {
                            label += '<strong style="color: ' + param.color + '; text-transform: capitalize;">' + param.seriesName.replaceAll('_',' ') + '</strong>: ' + param.value + '<br/>'
                        })

                        return label
                    }
                },
                // toolbox: {
                //     feature: {
                //         saveAsImage: {
                //             show: true
                //         }
                //     },
                //     top: -10,
                //     right: 100
                // }
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
                    name: 'New Cases Per Million',
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
                        name: self.state.selectedMetric,
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
            } else {
                series.splice(1,1);
            }

            self.setState({
                options: {
                    
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

    downloadChart = () => {
        const echartInstance = this.echartRef.getEchartsInstance();

        var a = document.createElement("a");
        a.href = echartInstance.getDataURL();
        a.download = this.state.selectedCountry.location;
        a.click();
        
    }

    render() {
        let self = this;
        return (
            <>
                <Card className="border-0 rounded">
                    <Card.Body>
                        <Row className="gx-2 align-items-center">
                            <Col xs="auto">
                                <Button variant="light-grey" style={{color: "#094151"}} onClick={() => self.props.onDeselectCountry() }><FontAwesomeIcon icon={faArrowLeft} />&nbsp;Back</Button>
                            </Col>
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
                            <Col>
                                <div>{this.state.selectedCountry.location}</div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 rounded mt-4">
                    <Card.Body>
                        <h5>Compare data to new cases per million</h5>
                        <hr/>
                        <Row className="mb-5">
                            <Col xs="auto" className="position-relative"><div className="position-relative top-50 start-50 translate-middle"><strong>Overlay dataset:</strong></div></Col>
                            <Col>
                                <Form.Select className="border-0" style={{backgroundColor: '#F6F6F6'}} onChange={this.selectMetric}>
                                    <option value="">Add a comparison metric</option>

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
                                    <option value="new_tests_smoothed">Tests &amp; Positivity: New Tests Smoothed Per Thousand</option>
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
                                </Form.Select>   
                            </Col>
                        </Row>
                        <ReactECharts
                        ref={(e) => { this.echartRef = e; }}
                        option={this.state.options} 
                        style={{height: '300px'}}
                        />
                        <hr/>
                        
                        { this.state.selectedMetric != '' ?
                            <>


                                <h6 className="mt-3">What is "{_.filter(self.props.definitions, function(def) { return def.name == self.state.selectedMetric})[0].name.replaceAll('_',' ') }" ?</h6>
                                <p className="text-black-50 mt-3">{ _.filter(self.props.definitions, function(def) { return def.name == self.state.selectedMetric})[0].owid_definition }</p>
                                <hr/>
                                <Row className="align-items-center">
                                    <Col><span className="text-black-50">Source: { _.filter(self.props.definitions, function(def) { return def.name == self.state.selectedMetric})[0].source }</span></Col>
                                </Row>
                                <hr/>
                                <h6 className="mt-3">About this data:</h6>
                                <p className="text-black-50 mt-3">{ _.filter(self.props.definitions, function(def) { return def.name == self.state.selectedMetric})[0].text }</p>
                            </>
                            : 
                            <>
                                <h6 className="mt-3">What is "New Cases Smoothed Per Million" ?</h6>
                                <p className="text-black-50 mt-3">{ _.filter(self.props.definitions, function(def) { return def.name == 'new_cases_smoothed_per_million'})[0].owid_definition }</p>
                                <hr/>
                                <Row className="align-items-center">
                                    <Col><span className="text-black-50">Source: { _.filter(self.props.definitions, function(def) { return def.name == 'new_cases_smoothed_per_million'})[0].source }</span></Col>
                                </Row>
                                <hr/>
                                <h6 className="mt-3">About this data</h6>
                                <p className="text-black-50 mt-3">{ _.filter(self.props.definitions, function(def) { return def.name == 'new_cases_smoothed_per_million'})[0].text }</p>
                            </>
                        }
                        <hr/>
                        <Row className="justify-content-end">
                            <Col xs="auto"><Button size="sm" onClick={() => this.downloadChart()} variant="control-grey">DOWNLOAD IMAGE</Button></Col>
                        </Row>
                        
                        
                    </Card.Body>
                </Card>


            </>
        );
    }
}