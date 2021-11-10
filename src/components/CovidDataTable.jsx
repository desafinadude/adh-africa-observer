import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import DataTable, { defaultThemes } from 'react-data-table-component';

import { MultiSelect } from "react-multi-select-component";

import * as countriesList from '../data/countries.json';

import { owid_fields } from '../data/owid_fields.js';

export class CovidDataTable extends React.Component {
    constructor() {
        super();
        this.state = {
            data: [],
            visible_data: [],
            columns: [],
            columns_select: [],
            columns_selected: [],
            countries_select: [],
            countries_selected: [],
            conditionalRowStyles: [
                {
                    when: row => row > 2,
                    style: {
                        backgroundColor: 'rgba(63, 195, 128, 0.9)',
                        color: 'white',
                        '&:hover': {
                            cursor: 'pointer',
                        },
                    },
                }
            ],
            customStyles: {
                header: {
                    style: {
                        minHeight: '56px',
                    },
                },
                headRow: {
                    style: {
                        borderTopStyle: 'solid',
                        borderTopWidth: '1px',
                        borderTopColor: defaultThemes.default.divider.default,
                    },
                },
                headCells: {
                    style: {
                        '&:not(:last-of-type)': {
                            borderRightStyle: 'solid',
                            borderRightWidth: '1px',
                            borderRightColor: defaultThemes.default.divider.default,
                        },
                    }
                },
                cells: {
                    style: {
                        '&:not(:last-of-type)': {
                            borderRightStyle: 'solid',
                            borderRightWidth: '1px',
                            borderRightColor: defaultThemes.default.divider.default,
                        },
                    },
                }
            }
        }
    }

    componentDidMount() {
        let self = this;

        let columns = [];
        let columns_select = [];
        let countries_select = [];

        for (let i = 0; i < owid_fields.length; i++) {
            
            let cell = row => row[owid_fields[i]];

            if(owid_fields[i] == 'location') {
                cell = row => 
                    <>
                        <div style={{width: '2em', height: '2em', borderRadius: '50%', overflow: 'hidden', position: 'relative'}} className="border">
                            <ReactCountryFlag
                            svg
                            countryCode={getCountryISO2(row.iso_code)}
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
                        <div className="text-truncate">{ row.location }</div>
                    </>
            }
            
            columns.push(
                {
                    name: <span className="text-uppercase text-truncate">{owid_fields[i].replaceAll('_', ' ')}</span>,
                    selector: row => row[owid_fields[i]],
                    cell: cell,
                    sortable: true,
                    field: owid_fields[i]
                }
            )

            columns_select.push(
                {
                    value: owid_fields[i],
                    label: owid_fields[i]
                }
            )

            
        }

        for (let i = 0; i < countriesList.length; i++) {
            countries_select.push(
                {
                    value: countriesList[i].iso_code,
                    label: countriesList[i].location
                }
            )
        }

        self.setState(
            {
                columns: columns, 
                visible_columns: columns,
                columns_select: columns_select,
                columns_selected: columns_select,
                countries_select: countries_select,
                countries_selected: countries_select
            }
        );

        self.get_data();
       
    }

    componentDidUpdate(prevProps, prevState) {
        let self = this;
        
        if(prevProps.currentDate != self.props.currentDate) {
            self.get_data();
        }
        
    }

    get_data() {
        let self = this;

        console.log('here');

        axios.get('https://adhtest.opencitieslab.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"fc2a18a1-0c76-4afe-8934-2b9a9dacfef4"%20where%20date%20%3D%20%27' + this.props.currentDate + '%27')
        .then(function(response) {
            self.setState(
                {
                    data: response.data.result.records,
                    visible_data: response.data.result.records
                }
            );
        })
    }

    select_countries = (e) => {
        let self = this;

        self.setState({countries_selected: e});

        let countries = [];

        for (let i = 0; i < e.length; i++) {
            countries.push(e[i].value);
        }

        let visible_data = _.filter(this.state.data, function(o) { return _.find(countries, function(c) { return c == o.iso_code; }) != undefined });

        self.setState({visible_data: visible_data});

    }

    select_columns = (e) => {
        let self = this;
        self.setState({columns_selected: e})

        let columns = [];

        for (let i = 0; i < e.length; i++) {
            columns.push(e[i].value);
        }

        let visible_columns = _.filter(this.state.columns, function(o) { return _.find(columns, function(c) { return c == o.field }) != undefined });

        self.setState({visible_columns: visible_columns});

    }

    

   

    render() {
        let self = this;
        return (
            
            <Card>
                <Card.Body>

                    <Row className="mb-4" style={{'position': 'relative', 'zIndex': 2}}>
                        <Col className="d-flex align-items-center">
                            <h3 className="mb-0" style={{fontWeight: 500 }}>
                                {
                                    new Date(this.props.currentDate).toLocaleDateString(
                                        'en-gb',
                                        {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                        }
                                    )
                                }
                            </h3>
                        </Col>
                        <Col xs="4">
                            <MultiSelect
                                options={this.state.countries_select}
                                value={this.state.countries_selected}
                                onChange={this.select_countries}
                                overrideStrings={
                                    {
                                        "allItemsAreSelected": "All COUNTRIES are selected.",
                                        "clearSearch": "Clear Search",
                                        "noOptions": "No options",
                                        "search": "Search",
                                        "selectAll": "Select All",
                                        "selectAllFiltered": "Select All (Filtered)",
                                        "selectSomeItems": "Select Countries"
                                    }
                                }
                            />
                        </Col>
                        <Col xs="4">
                            
                            <MultiSelect
                                options={this.state.columns_select}
                                value={this.state.columns_selected}
                                onChange={this.select_columns}
                                overrideStrings={
                                    {
                                        "allItemsAreSelected": "All METRICS are selected.",
                                        "clearSearch": "Clear Search",
                                        "noOptions": "No options",
                                        "search": "Search",
                                        "selectAll": "Select All",
                                        "selectAllFiltered": "Select All (Filtered)",
                                        "selectSomeItems": "Select Metrics"
                                    }
                                }
                            />
                        </Col>
                    </Row>

                    
                    <DataTable 
                    columns={this.state.visible_columns}
                    data={this.state.visible_data}
                    dense={false}
                    striped={true}
                    fixedHeader={true}
                    conditionalRowStyles={this.state.conditionalRowStyles}
                    customStyles={this.state.customStyles}
                    />
                </Card.Body>
            </Card>
            
        );
    }
}