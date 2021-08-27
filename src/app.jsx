import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import _ from 'lodash';
import * as URI from 'uri.js';
import './app.scss';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle, faRedo, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

import { RiskMap } from './components/RiskMap';
import { Leaderboard } from './components/Leaderboard';
import { CountryData } from './components/CountryData';

import * as countriesList from './data/countries.json';

export class App extends React.Component {

    constructor(){
        super();
        this.state = {
            dataUrl:'https://adhtest.opencitieslab.org/api/3/action/datastore_search?resource_id=7e58603e-0b06-47cf-8e77-54b0d567d6eb&limit=100000',
            // dataUrl: 'https://adhtest.opencitieslab.org/api/3/action/datastore_search?resource_id=fd38833f-6482-4772-b2d1-8859ea7726f8&limit=100000',
            error: false,
            loading: true,
            data: [],
            dates: [],
            currentDate: '',
            daySelect: React.createRef(),
            monthSelect: React.createRef(),
            yearSelect: React.createRef(),
            currentDateCount: undefined,
            selectedDateData: [],
            selectedDateDataMap: [],
            playingTimeline: false,
            
            selectedCountries: [],
            ref: null,
        },
        this.playTimeline = this.playTimeline.bind(this);
        this.timer = undefined;
        
    }

    componentDidMount() {
        let self = this;
        axios.get(self.state.dataUrl)
        .then(function(response) {
            self.setState({data: response.data.result.records});

            let dates = _.map(_.uniqBy(response.data.result.records, 'date'),'date');
            dates = _.orderBy(dates, [(date) => new Date(date)], ['asc']);
            
            self.setState({
                dates: dates,
                loading: false,
                currentDate: dates[dates.length-1],
                currentDateCount: dates.length-1,
                selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == dates[dates.length-1] && o.change != null) }),['change'],['desc']),
                selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == dates[dates.length-1]) }),['change'],['desc'])
            });

        }).catch(function(error) {
            self.setState({loading: false, error: true});
        })
      
    }

    componentDidUpdate() {
        let self = this;
        
    }

    onUpdate = (render, handle, value, un, percent) => {
        let self = this;
        this.setState({
          currentDate: this.state.dates[parseInt(value[0]-1)],
          currentDateCount: parseInt(value[0]-1),
          selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[parseInt(value[0]-1)] && o.change != null) }),['change'],['desc']),
          selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[parseInt(value[0]-1)]) }),['change'],['desc'])
        });
        

    }

    dateSelect = (e) => {
        let self = this;
        
        let day = this.state.daySelect.current.value;
        let month = this.state.monthSelect.current.value;
        let year = this.state.yearSelect.current.value;

        let date = new Date(day + ' ' + month + ' ' + year).toISOString().split('T')[0];
        date = date + 'T00:00:00';

        let dateCount = _.findIndex(self.state.dates, function(o) { return o == date; });

        if(dateCount > -1) {
            self.setState({
                currentDate: date,
                currentDateCount: dateCount,
                selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[dateCount] && o.change != null) }),['change'],['desc']),
                selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[dateCount]) }),['change'],['desc'])
            });
            self.state.ref.noUiSlider.set(dateCount);
        }
        
    }

    togglePlayTimeline = () => {
        let self = this;
        console.log('before',self.state.playingTimeline); 
        self.setState(({ playingTimeline }) => ({ playingTimeline: !playingTimeline }));
        setTimeout(function() {
            if(self.state.playingTimeline == true) {
                self.playTimeline();
            } else {
                window.clearTimeout(self.timer);
            }
        },1000);
        
        
        
    }

    playTimeline = () => {
        let self = this;
        if (self.state.currentDateCount < self.state.dates.length) {
            self.setState({ currentDateCount: self.state.currentDateCount + 1 });
            self.setState({
                currentDate: self.state.dates[self.state.currentDateCount],
                selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[self.state.currentDateCount] && o.change != null) }),['change'],['desc']),
                selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[self.state.currentDateCount]) }),['change'],['desc'])
            });
            self.state.ref.noUiSlider.set(parseInt(self.state.currentDateCount));
            self.timer = setTimeout( () => { self.playTimeline() }, 500 );
        } else {
            window.clearTimeout(self.timer);
            self.setState({playingTimeline: false});
        }

        
    }

    jumpToLatest = () => {
        let self = this;
        this.setState({
            currentDate: self.state.dates[self.state.dates.length-1],
            currentDateCount: self.state.dates.length,
            selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[self.state.dates.length-1] && o.change != null) }),['change'],['desc']),
            selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[self.state.dates.length-1]) }),['change'],['desc'])
        });
        
        self.state.ref.noUiSlider.set(self.state.dates.length);
        
    }

    countrySelect = (country) => {
        let self = this;
        if(_.find(self.state.selectedCountries, function(o) { return o.iso_code == country.iso_code }) == undefined) {
            // self.setState({selectedCountries: [...self.state.selectedCountries, country]});
            self.setState({selectedCountries: [country]});
        }
    }

    

    onDeselectCountry = () => {
        let self = this;
        self.setState({selectedCountries: []});
    }

    

    countryRemove = (country) => {
        let self = this;
        let selectedCountries = self.state.selectedCountries;
        let keepCountries = _.filter(selectedCountries, function(o) { return o.iso_code != country; });
        self.setState({selectedCountries: keepCountries});
    }

    render() {
        return (
            this.state.loading ? 
            <>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <Spinner animation="grow" />
                    <h3 className="mt-4">Loading</h3>
                </div>
            </> :
            this.state.error ?
            <>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} size="5x"/>
                    <h3 className="mt-4">Error Fetching Data</h3>
                </div>
            </> :
            <>
                <div className="header py-5">
                    <Container>
                        <Row>
                            <Col>
                                <h1>COVID-19 Resurgence Map</h1>
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col><h5>Select a country:</h5></Col>
                        </Row>

                        <Row className="mt-2 mb-4">
                            <Col xs="auto">
                                {/* <Form.Select className="border-0 text-white" style={{backgroundColor: '#094151' }}>
                                    <option>Choose Countries</option>
                                    {countriesList.map((country,index) => (
                                        <option value={country.iso_code}>{country.location}</option>
                                    ))}
                                </Form.Select> */}
                                <DropdownButton title="Choose Countries" className="country-select">
                                    {countriesList.map((country,index) => (
                                        <Dropdown.Item key={country.iso_code} onClick={() => this.countrySelect({iso_code: country.iso_code, location: country.location})}>{country.location}</Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </Col>
                            <Col>
                                {this.state.selectedCountries.map((country) => (
                                    <Button variant="control-grey" key={country.iso_code} className="mx-1" onClick={() => this.countryRemove(country.iso_code)}>
                                        <Row>
                                            <Col>
                                                <div style={{width: '1.5em', height: '1.5em', borderRadius: '50%', overflow: 'hidden', position: 'relative'}} className="border">
                                                    <ReactCountryFlag
                                                    svg
                                                    countryCode={getCountryISO2(country.iso_code)}
                                                    style={{
                                                        position: 'absolute', 
                                                        top: '30%',
                                                        left: '30%',
                                                        marginTop: '-50%',
                                                        marginLeft: '-50%',
                                                        fontSize: '2em',
                                                        lineHeight: '2em',
                                                    }}/>
                                                </div>
                                            </Col>
                                            <Col xs="auto">{country.location}</Col>
                                            <Col>
                                                <FontAwesomeIcon icon={faTimes} style={{ fontSize:"10px"}}/>
                                            </Col>
                                        </Row>
                                    </Button>
                                ))}
                            </Col>
                        </Row>

                        <Row>
                            <Col md={3}>
                                <h5 className="mt-1">Current date showing:</h5>
                                
                                <h1 style={{fontWeight: 500, fontSize: window.innerWidth < 1400 ? '2.2rem' : '2.5rem'}}>
                                    {
                                        new Date(this.state.currentDate).toLocaleDateString(
                                            'en-gb',
                                            {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                            }
                                        )
                                    }
                                </h1>
                            </Col>
                            <Col md={6}>
                                <h5 className="mt-1">Scrub the timeline to change date:</h5>
                                <Row>
                                    <Col xs={1}>
                                        <OverlayTrigger
                                        placement="bottom"
                                        overlay={<Tooltip>Play through entire timeline</Tooltip>}>
                                            <Button variant="control-grey" onClick={() => this.togglePlayTimeline()}>
                                                <FontAwesomeIcon icon={ this.state.playingTimeline == true ? faPause : faPlay} color="#094151"/>
                                            </Button>
                                        </OverlayTrigger>
                                    </Col>
                                    <Col>
                                        <div className="bg-control-grey px-4 h-100 rounded cursor-pointer">
                                            { this.state.dates.length > 0 ?
                                            <Nouislider
                                                instanceRef={instance => {
                                                    if (instance && !this.state.ref) {
                                                    this.setState({ ref: instance });
                                                    }
                                                }}
                                                onSlide={this.onUpdate}
                                                range={{ min: 1, max: this.state.dates.length }}
                                                step={1}
                                                start={[this.state.dates.length]}
                                                pips= {{
                                                    mode: 'count',
                                                    values: 6,
                                                    density: 4,
                                                    stepped: true
                                                }}
                                            />
                                            : ''}
                                        </div>
                                    </Col>
                                </Row>
                                
                            </Col>
                            <Col md={3} className="timeline-date-select">
                                <h5 className="mt-1">Or select a specific date:</h5>
                                <Row className="gx-2">
                                    <Col xs="auto">
                                        
                                        <Form.Select value={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { day: 'numeric' }) } className="h-100 border-0 text-black bg-control-grey" onChange={this.dateSelect.bind(this)} ref={this.state.daySelect}>
                                            { Array.from({length: 31}, (x, i) => 
                                                <option key={i+1} value={i+1}>{i+1}</option>
                                            )}
                                        </Form.Select>
                                    </Col>
                                    <Col>
                                        <Form.Select value={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { month: 'short' }) } className="h-100 border-0 text-black bg-control-grey" onChange={this.dateSelect.bind(this)} ref={this.state.monthSelect}>
                                            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month,index) =>
                                                <option key={index} value={month}>{month}</option>
                                            )}
                                        </Form.Select>
                                    </Col>
                                    <Col>
                                        <Form.Select value={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { year: 'numeric' }) } className="h-100 border-0 text-black bg-control-grey" onChange={this.dateSelect.bind(this)} ref={this.state.yearSelect}>
                                            <option key="2020" value="2020">2020</option>
                                            <option key="2021" value="2021">2021</option>
                                        </Form.Select>
                                    </Col>
                                    <Col xs="auto">
                                        <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Jump to most recent</Tooltip>}>
                                            <Button variant="control-grey" style={{height: '100%'}} onClick={this.jumpToLatest}>
                                                <FontAwesomeIcon icon={faRedo} color="#094151"/>
                                            </Button>
                                        </OverlayTrigger>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        

                    </Container>
                </div>

                <Container className="my-5">
                    <Row>
                        <Col md={6}>
                            <RiskMap onCountrySelect={this.countrySelect} data={this.state.selectedDateDataMap}/>
                        </Col>
                        <Col>
                            { 
                                this.state.selectedCountries.length > 0 ? 
                                    <CountryData selectedCountries={this.state.selectedCountries} onDeselectCountry={this.onDeselectCountry}/> 
                                :
                                   <Leaderboard data={this.state.selectedDateData} onCountrySelect={this.countrySelect} playingTimeline={this.state.playingTimeline}/>
                                    
                            }
                        </Col>
                    </Row>
                </Container>
            </>)
        
    }

}


const container = document.getElementsByClassName('app')[0];

ReactDOM.render(React.createElement(App), container);