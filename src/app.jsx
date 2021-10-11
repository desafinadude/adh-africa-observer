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
import Placeholder from 'react-bootstrap/Placeholder';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle, faRedo, faPlay, faPause, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { Header } from './components/Header';
import { RiskMap } from './components/RiskMap';
import { Leaderboard } from './components/Leaderboard';
import { CountryData } from './components/CountryData';

import * as countriesList from './data/countries.json';

export class App extends React.Component {

    constructor(){
        super();
        this.state = {
            // api: {
            //     baseUrl: 'https://ckan.africadatahub.org/api/3/',
            //     resurgenceData: 'e6489086-6e9a-4e3b-94c5-5236809db053',
            //     definitions: '0ac414ef-1c30-47b4-bcca-6e95d1a9b498',
            //     countryData: '8bf9f7fe-ec0d-468d-bc7e-be9a1130dd3a'
            // },
            api: {
                baseUrl: 'https://adhtest.opencitieslab.org/api/3/',
                resurgenceData: '7e58603e-0b06-47cf-8e77-54b0d567d6eb',
                definitions: 'c070bdc8-59df-4d11-bc2d-cf0fa5e425fe',
                countryData: 'fc2a18a1-0c76-4afe-8934-2b9a9dacfef4'
            },
            definitions: [],
            no_embed_style: {
                paddingTop: '20px'
            },
            error: false,
            loading: true,
            loadingComplete: false,
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

        if(window.location.search != '?embed') {
            self.setState({no_embed_style: { paddingTop: '100px' }})
        }

        axios.get(self.state.api.baseUrl + 'action/datastore_search?resource_id=' + self.state.api.definitions + '&limit=100000')
        .then(function(response) {
            self.setState({definitions: response.data.result.records });
        })

        axios.get('https://adhtest.opencitieslab.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + self.state.api.resurgenceData +'"%20WHERE%20date%20IN%20(SELECT%20max(date)%20FROM%20"' + self.state.api.resurgenceData +'")')
        .then(function(response) {


            self.setState({data: response.data.result.records});
            let dates = _.map(_.uniqBy(response.data.result.records, 'date'),'date');
            self.setState({
                dates: dates,
                loading: false,
                currentDate: dates[dates.length-1],
                currentDateCount: dates.length-1,
                selectedDateData: _.orderBy(self.state.data,['change'],['desc']),
                selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == dates[dates.length-1]) }),['change'],['desc'])
            });

            // self.state.ref.noUiSlider.set(10);

        }).catch(function(error) {
            console.log(error);
            self.setState({loading: false, error: true});
        })


        axios.get(self.state.api.baseUrl + 'action/datastore_search?resource_id=' + self.state.api.resurgenceData + '&limit=100000')
        .then(function(response) {
            self.setState({data: response.data.result.records});

            let dates = _.map(_.uniqBy(response.data.result.records, 'date'),'date');
            dates = _.orderBy(dates, [(date) => new Date(date)], ['asc']);
            
            self.setState({
                dates: dates,
                loading: false,
                currentDate: dates[dates.length-1],
                currentDateCount: dates.length-1,
                selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == dates[dates.length-1] && o.change != null && o.change != 'NaN') }),['change'],['desc']),
                selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == dates[dates.length-1]) }),['change'],['desc'])
            });

            self.setState({loadingComplete: true});

        }).catch(function(error) {
            console.log(error);
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
          selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[parseInt(value[0]-1)] && o.change != null && o.change != 'NaN') }),['change'],['desc']),
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
                selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[dateCount] && o.change != null && o.change != 'NaN') }),['change'],['desc']),
                selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[dateCount]) }),['change'],['desc'])
            });
            self.state.ref.noUiSlider.set(dateCount);
        }
        
    }

    togglePlayTimeline = () => {
        let self = this;
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
        if (self.state.currentDateCount < self.state.dates.length-1) {
            self.setState({ currentDateCount: self.state.currentDateCount + 1 });
            self.setState({
                currentDate: self.state.dates[self.state.currentDateCount],
                selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[self.state.currentDateCount] && o.change != null && o.change != 'NaN') }),['change'],['desc']),
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
            selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[self.state.dates.length-1] && o.change != null && o.change != 'NaN') }),['change'],['desc']),
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

    onModeSwitch = () => {
        let self = this;
        this.setState({
            selectedDateData: [],
            selectedDateDataMap: []
        });
        setTimeout(function() {
            self.setState({
                selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[self.state.currentDateCount] && o.change != null && o.change != 'NaN') }),['change'],['desc']),
                selectedDateDataMap: _.orderBy(_.filter(self.state.data, function(o) { return (o.date == self.state.dates[self.state.currentDateCount]) }),['change'],['desc'])
            });
        }, 500);
        
        self.state.ref.noUiSlider.set(self.state.currentDateCount);
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
                <div className="header pb-5">

                    { window.location.search != '?embed' ? <Header /> : '' }

                    <Container style={this.state.no_embed_style} className="justify-content-between">
                        <Row>
                            <Col>
                                <h1>COVID-19 Resurgence Map</h1>
                            </Col>
                            <Col xs="auto">
                                {window.location.search == '?embed' ? <a href="https://www.africadatahub.org" target="_blank"><img src="https://assets.website-files.com/6017e7ecb14082cec5d531af/605dc8591d244b03000f013c_adh-logo.svg"/></a> :
                                <Button size="lg" variant="outline-control-grey" style={{color: "#094151"}} href="https://www.africadatahub.org/data-resources"><FontAwesomeIcon icon={faArrowLeft} />&nbsp;Back</Button> }
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
                                            <Col xs="auto pe-0">
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
                                            <Col className="text-start">{country.location}</Col>
                                            <Col xs="auto">
                                                <FontAwesomeIcon icon={faTimes} style={{ fontSize:"10px"}}/>
                                            </Col>
                                        </Row>
                                    </Button>
                                ))}
                            </Col>
                        </Row>

                        {this.state.selectedCountries.length > 0 && window.innerWidth < 800 ? '' :
                            <Row>
                                <Col xs="auto" lg={3}>
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
                                <Col lg={6}>
                                    { this.state.loadingComplete ?
                                    <>
                                        <h5 className="mt-1">Scrub the timeline to change date:</h5>
                                        <Row>
                                            <Col xs="auto">
                                                <OverlayTrigger
                                                placement="bottom"
                                                overlay={<Tooltip>Play through entire timeline from current position.</Tooltip>}>
                                                    <div>
                                                    <Button variant="control-grey" onClick={() => this.togglePlayTimeline()} disabled={(this.state.currentDateCount == this.state.dates.length-1 || !this.state.loadingComplete) ? true : false}>
                                                        <FontAwesomeIcon icon={ this.state.playingTimeline == true ? faPause : faPlay} color="#094151"/>
                                                    </Button>
                                                    </div>
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
                                                        range={{ min: 1, max: this.state.dates.length > 1 ? this.state.dates.length : 10 }}
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
                                    </>
                                    : 
                                        <>
                                            <h5 className="mt-1">Loading historic data...</h5>
                                            <Placeholder as="p" animation="glow">
                                                <Placeholder xs={12} size="lg"/>
                                            </Placeholder>
                                        </>
                                    }
                                    
                                </Col>
                                <Col lg={3} className="timeline-date-select">
                                    { this.state.loadingComplete ?
                                    <>
                                        <h5 className="mt-1">Or select a specific date:</h5>
                                        <Row className="gx-2">
                                            <Col xs="auto">
                                                
                                                <Form.Select disabled={!this.state.loadingComplete} value={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { day: 'numeric' }) } className="h-100 border-0 text-black bg-control-grey" onChange={this.dateSelect.bind(this)} ref={this.state.daySelect}>
                                                    { Array.from({length: 31}, (x, i) => 
                                                        <option key={i+1} value={i+1}>{i+1}</option>
                                                    )}
                                                </Form.Select>
                                            </Col>
                                            <Col>
                                                <Form.Select disabled={!this.state.loadingComplete} value={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { month: 'short' }) } className="h-100 border-0 text-black bg-control-grey" onChange={this.dateSelect.bind(this)} ref={this.state.monthSelect}>
                                                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'].map((month,index) =>
                                                        <option key={index} value={month}>{month}</option>
                                                    )}
                                                </Form.Select>
                                            </Col>
                                            <Col>
                                                <Form.Select disabled={!this.state.loadingComplete} value={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { year: 'numeric' }) } className="h-100 border-0 text-black bg-control-grey" onChange={this.dateSelect.bind(this)} ref={this.state.yearSelect}>
                                                    <option key="2020" value="2020">2020</option>
                                                    <option key="2021" value="2021">2021</option>
                                                </Form.Select>
                                            </Col>
                                            <Col xs="auto">
                                                <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip>Jump to most recent</Tooltip>}>
                                                    <Button disabled={!this.state.loadingComplete} variant="control-grey" style={{height: '100%'}} onClick={this.jumpToLatest}>
                                                        <FontAwesomeIcon icon={faRedo} color="#094151"/>
                                                    </Button>
                                                </OverlayTrigger>
                                            </Col>
                                        </Row>
                                    </>
                                    : 
                                        <>
                                        <h5 className="mt-1">...</h5>
                                        <Placeholder as="p" animation="glow">
                                            <Placeholder xs={12} size="lg"/>
                                        </Placeholder>
                                        </>
                                    }
                                </Col>
                            </Row>
                        }

                    </Container>
                </div>

                <Container className="my-4">
                    <Row>
                        {this.state.selectedCountries.length > 0 && window.innerWidth < 800 ? '' :
                            <Col lg={6} className="mb-4">
                                {this.state.definitions.length > 0 ?
                                    <RiskMap onCountrySelect={this.countrySelect} data={this.state.selectedDateDataMap} onModeSwitch={this.onModeSwitch} definitions={this.state.definitions}/>
                                : '' }
                            </Col>
                        }
                        <Col>
                            { 
                                this.state.selectedCountries.length > 0 ? 
                                    <CountryData selectedCountries={this.state.selectedCountries} onDeselectCountry={this.onDeselectCountry} definitions={this.state.definitions}/> 
                                :
                                    <>
                                        {this.state.definitions.length > 0 ?
                                            <Leaderboard data={this.state.selectedDateData} onCountrySelect={this.countrySelect} playingTimeline={this.state.playingTimeline} definitions={this.state.definitions}/>
                                        : '' }
                                    </>
                            }
                        </Col>
                    </Row>
                </Container>
            </>)
        
    }

}


const container = document.getElementsByClassName('app')[0];

ReactDOM.render(React.createElement(App), container);