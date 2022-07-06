import React from 'react';
import _ from 'lodash';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { CaseGradient } from '../utils/Gradient';
import { countriesData } from '../data/geojson/africa.js';

import * as definitions from '../data/definitions.json';
import * as texts from '../data/texts.json';


export class CaseMap extends React.Component {
    constructor() {
        super();
        this.state = {
            map: undefined
        }
    }

  



    style = (feature) => {

        let self = this;
        let color = 0;

        if(feature.properties.adm0_a3 == 'SOL' || feature.properties.adm0_a3 == 'SAH') {
            color = null;
        } 
        else if(self.props.data != undefined && self.props.data.length > 0) {
            let country = _.filter(self.props.data, function(o) { return o.iso_code == feature.properties.adm0_a3; })[0];
            if(country != undefined) {
                color = country[this.props.selectedBaseMetric];
            }
        }

        return {
            fillColor: CaseGradient(color, this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 250 : 2500),
            weight: 0.5,
            opacity: 1,
            color: '#fff',
            dashArray: '0',
            fillOpacity: 1
        };
        
    }

    countryAction = (feature, layer) => {

        let self = this;

        layer.on('click', function (e) {
            if(feature.properties.adm0_a3 != 'SOL' && feature.properties.adm0_a3 != 'SAH') {
                self.props.onCountrySelect(
                    { 
                        iso_code: e.target.feature.properties.adm0_a3,
                        location: e.target.feature.properties.name
                    }
                );
            }

        });

        layer.on('mouseover', function (e) {
            if(e.target.feature.properties.adm0_a3 != 'SOL' && e.target.feature.properties.adm0_a3 != 'SAH') {
                layer.bindTooltip(function (layer) {
                            let selectedBaseMetric = _.filter(self.props.data, function(o) { return o.iso_code == e.target.feature.properties.adm0_a3})[0][self.props.selectedBaseMetric];
                            return ('<strong>' + e.target.feature.properties.name + '<br/>' + (selectedBaseMetric < 1 ? Math.round(selectedBaseMetric * 100) / 100  : Math.round(selectedBaseMetric)) + '</strong>'); 
                    }, {permanent: true, opacity: 1}  
                );
            } else {
                layer.bindTooltip(function (layer) {
                    return ('<strong>' + e.target.feature.properties.name + '<br/>-</strong>'); 
                }, {permanent: true, opacity: 1}  
            ); 
            }
            
            this.setStyle({
                'color': '#000'
            });
        });
        layer.on('mouseout', function () {
            layer.bindTooltip().closeTooltip();
            this.setStyle({
              'color': '#fff'
            });
        });


    }


    render() {
        let self = this;
        return (
            <>
                <Card className="border-0 rounded">
                    <Card.Body>
                        <Row>
                            <Col className="pt-2">
                                <h5 className="d-inline">{this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'New Cases Per Million (Smoothed)' : 'New Cases (Smoothed)' }</h5>
                            </Col>
                            <Col xs="auto">
                                <Button className="me-1" size="md" variant={this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'primary' : 'control-grey'} onClick={() => this.props.selectBaseMetric() }>{this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ? 'HIDE' : 'SHOW' } PER MILLION</Button>
                            </Col>
                        </Row>
                        <hr/>
                        <MapContainer 
                            center={[-0, 20]}
                            zoom={2.5}
                            scrollWheelZoom={false}
                            zoomControl={false}
                            attributionControl={false}
                            doubleClickZoom={false}
                            touchZoom={false}
                            style={{background: '#fff'}}
                            dragging={false}
                            >
                            {/* key={this.props.data[0].date} */}
                            {this.props.data[0] != undefined ?
                                <GeoJSON
                                key={this.props.update}
                                onEachFeature={this.countryAction}
                                data={countriesData}
                                style={this.style}
                                />
                            : '' }
                            
                            <div className="position-absolute fw-bold map-legend" style={{bottom: 0}}>
                                
                                {this.props.selectedBaseMetric == 'new_cases_smoothed_per_million' ?
                                    <>
                                        <div>
                                            <div style={{backgroundColor: CaseGradient(1000)}} className="chart-scale position-relative">&nbsp;</div> &gt; 500 new cases per million
                                        </div>
                                        <div className="my-1">
                                            <div style={{backgroundColor: CaseGradient(0)}} className="chart-scale position-relative">&nbsp;</div> 0 new case per million
                                        </div>
                                    </>
                                :
                                    <>
                                        <div>
                                            <div style={{backgroundColor: CaseGradient(1000)}} className="chart-scale position-relative">&nbsp;</div> &gt; 5000 new cases
                                        </div>
                                        <div className="my-1">
                                            <div style={{backgroundColor: CaseGradient(0)}} className="chart-scale position-relative">&nbsp;</div> 0 new cases
                                        </div>
                                    </>
                                }

                                <div className="my-1">
                                    <div style={{backgroundColor: '#999'}} className="chart-scale position-relative">&nbsp;</div> No Data
                                </div>
                            </div>
                        </MapContainer>
                        <hr/>
                        <Row className="align-items-center">
                            <Col><span className="text-black-50">Source: <a className="text-black-50" target="_blank" href={_.filter(texts[this.props.api.dataset], function(def) { return def.name == 'source'})[0].link}>{_.filter(texts[this.props.api.dataset], function(def) { return def.name == 'source'})[0].link_text}</a></span></Col>
                        </Row>
                        <hr className="d-none d-md-block"/>
                        <div className="d-none d-md-block">
                            <h6 className="mt-3">{_.filter(texts[this.props.api.dataset], function(def) { return def.name == 'introductory_paragraph'})[0].title}</h6>
                            <p className="text-black-50 mt-3">{_.filter(texts[this.props.api.dataset], function(def) { return def.name == 'introductory_paragraph'})[0].text}</p>
                        </div>
                    </Card.Body>
                </Card>
            </>
        );
    }
}