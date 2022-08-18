import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import { ResponsiveContainer, ComposedChart, Bar, Brush, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { saveAs } from 'file-saver';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFileDownload } from '@fortawesome/free-solid-svg-icons';

import * as definitions from '../data/definitions.json';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <strong>{`${moment(label).format('MM/YY')}`}</strong>
                { payload.map((metric, index) => 
                    <div key={index} style={{color: metric.color}}>{`${Math.round(metric.value)}`}</div>
                ) }
            </div>
        );
    }
  
    return null;
  };

export class CountryData extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedCountry: '',
            selectedMetric: '',
            data: undefined,
            loading: true,
        }
    }

    componentDidMount() {
        let self = this;

        axios.get(this.props.api.url + 'action/datastore_search_sql?sql=SELECT%20*%20from%20"' + this.props.api.countryData + '"%20WHERE%20iso_code%20LIKE%20%27' + this.props.selectedCountry[0].iso_code + '%27',
            { headers: {
                "Authorization": process.env.CKAN
            }
        })
        .then(function(response) {
            
            let records = _.sortBy(response.data.result.records, ['date']);

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

            self.setState({
                loading: true
            });

            axios.get(this.props.api.url[this.props.api.env] + 'action/datastore_search_sql?sql=SELECT%20*%20from%20"' + this.props.api.data[this.props.api.dataset][this.props.api.env].countryData + '"%20WHERE%20iso_code%20LIKE%20%27' + this.props.selectedCountry[0].iso_code + '%27',
                { headers: {
                    "Authorization": this.props.api.env == 'dev' ? process.env.CKANDEV : process.env.CKAN
                }
            })
            .then(function(response) {

                let records = _.sortBy(response.data.result.records, ['date']);
                
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

    downloadChart = () => {

        let self = this;

        let chartSVG = document.querySelector('svg.recharts-surface');
        const width = chartSVG.clientWidth;
        const height = chartSVG.clientHeight;
        let svgURL = new XMLSerializer().serializeToString(chartSVG);
        let svgBlob = new Blob([svgURL], { type: "image/svg+xml;charset=utf-8" });
        let URL = window.URL || window.webkitURL || window;
        let blobURL = URL.createObjectURL(svgBlob);

        let image = new Image();
        image.onload = () => {
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
            let png = canvas.toDataURL('image/png', 1.0);
            saveAs(png, self.props.selectedCountry[0].iso_code + '--' + self.props.selectedBaseMetric + '--' + self.state.selectedMetric);
        };

        image.src = blobURL;

    }
    

    render() {
        let self = this;

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
                            {/* <Col xs={12} md="auto" className="pt-2"><h5 className={window.innerWidth < 800 ? 'text-center my-3' : 'my-0 d-inline'}>Compare data to {this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'New Cases Per Million (Smoothed)' : 'New Cases (Smoothed)' }</h5></Col> */}
                            <Col></Col>
                            {/* <Col md="auto">
                                <Button className="me-1" size="md" variant={this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'primary' : 'control-grey'} onClick={() => this.props.selectBaseMetric() }>{this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'HIDE' : 'SHOW' } PER MILLION</Button>
                            </Col> */}
                            <Col xs={12} md="auto" className={window.innerWidth < 800 ? 'text-center my-3' : 'my-0'}>
                                
                                <Button onClick={() => this.downloadChart()} variant="light-grey" style={{color: "#094151"}}><FontAwesomeIcon icon={faFileDownload} />&nbsp;Download Image</Button>
                                
                            </Col>
                        </Row>
                        
                        <hr/>
                        <Row className="mb-5">
                            {/* <Col xs="auto" className="position-relative"><div className="position-relative top-50 start-50 translate-middle"><strong>Overlay dataset:</strong></div></Col> */}
                            <Col xs="auto">
                                {/* <Form.Select className="border-0 me-1" style={{backgroundColor: '#F6F6F6'}} onChange={this.selectMetric}>
                                    { this.props.indicators.map((indicator, index) => 
                                        <option key={indicator.indicator_code} value={indicator.indicator_code}>{indicator.indicator_name}</option>
                                    ) }
                                </Form.Select> */}
                                <Form.Select className="border-0 me-1" style={{backgroundColor: '#F6F6F6'}} onChange={this.props.selectBaseMetric}>
                                    { this.props.indicators.map((indicator, index) => 
                                        <option key={indicator.indicator_code} value={indicator.indicator_code}>{indicator.indicator_name}</option>
                                    ) }
                                </Form.Select>
                            </Col>
                        </Row>
                        <div style={{minHeight: '100px'}} className="position-relative">
                            {this.state.loading && (
                                <div className="position-absolute top-50 start-50 translate-middle text-center">
                                    <Spinner animation="grow" />
                                    <h3 className="mt-4">Loading</h3>
                                </div>)
                            }
                            <>
                                {this.state.data != undefined && (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <ComposedChart data={this.state.data} margin={{top: 20, right: 0, bottom: 0, left: 0}}>
                                            <XAxis dataKey="date" tickFormatter={ tick => moment(tick).format('MM/YY') }/>
                                            <YAxis yAxisId="left" orientation="left" stroke="#99b3bb" domain={[0,_.maxBy(this.state.data.map(day => day[this.props.selectedBaseMetric] == 'NaN' ? null : parseInt(day[this.props.selectedBaseMetric])))]}/>
                                            <YAxis yAxisId="right" orientation="right" stroke="#089fd1" domain={[0,_.maxBy(this.state.data.map(day => day[this.state.selectedMetric] == 'NaN' ? null : parseInt(day[this.state.selectedMetric])))]}/>
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <Tooltip content={<CustomTooltip/>} />
                                            <Line yAxisId="left" dataKey={this.props.selectedBaseMetric}  fill="#99b3bb"/>
                                            {this.state.selectedMetric != '' && (<Line type="monotone" yAxisId="right" dot={false} dataKey={this.state.selectedMetric} stroke="#089fd1" />)}
                                            <Brush dataKey="date" height={30} stroke="#8eb4bf"  tickFormatter={ tick => moment(tick).format('MM/YY') }/>
                                        </ComposedChart>
                                    </ResponsiveContainer>)
                                }
                            </>
                            </div>
                        <hr/>
                        
                        { this.state.selectedMetric != '' ?
                            <>


                                {/* <h6 className="mt-3">What is "{_.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.state.selectedMetric})[0].name.replaceAll('_',' ') }" ?</h6>
                                <p className="text-black-50 mt-3">{ _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.state.selectedMetric})[0].owid_definition }</p> */}
                                <hr/>
                                {/* <Row className="align-items-center">
                                    <Col><span className="text-black-50">Source: { _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.state.selectedMetric})[0].source }</span></Col>
                                </Row> */}
                                <hr/>
                                {/* <h6 className="mt-3">About this data:</h6>
                                <p className="text-black-50 mt-3">{ _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.state.selectedMetric})[0].text }</p> */}
                            </>
                            : 
                            <>
                                {/* <h6 className="mt-3">What is {self.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'New Cases Per Million (Smoothed)' : 'New Cases (Smoothed)'} ?</h6>
                                <p className="text-black-50 mt-3">{ _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.props.selectedBaseMetric})[0].owid_definition }</p> */}
                                <hr/>
                                {/* <Row className="align-items-center">
                                    <Col><span className="text-black-50">Source: { _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.props.selectedBaseMetric})[0].source }</span></Col>
                                </Row> */}
                                <hr/>
                                {/* <h6 className="mt-3">About this data</h6>
                                <p className="text-black-50 mt-3">{ _.filter(definitions[this.props.api.dataset], function(def) { return def.name == self.props.selectedBaseMetric})[0].text }</p> */}
                            </>
                        }
                       
                        
                        
                    </Card.Body>
                </Card>


            </>
        );
    }
}