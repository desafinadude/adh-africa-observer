import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebookF, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';

export class Header extends React.Component {
    constructor() {
        super();
        this.state = {

        }
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    render() {
        let self = this;
        return (
            <div className="bg-white shadow fixed-top py-3">
                <Container>
                    <Row className="justify-content-between">
                        <Col>
                            <a href="#"><img src="adh-logo.svg" style={{height: '45px'}}/></a>
                        </Col>
                        <Col xs="auto" className="navlinks">
                            <Button variant="white" onClick={() => { location.href='https://www.africadatahub.org/data-resources'}}>Data resources</Button>
                            <Button variant="white" onClick={() => { location.href='https://www.africadatahub.org/about'}}>About</Button>
                            <Button variant="white" onClick={() => { location.href='https://twitter.com/Africa_DataHub'}}><FontAwesomeIcon icon={faTwitter} style={{ fontSize:"18px"}}/></Button>
                            <Button variant="white" onClick={() => { location.href='https://www.facebook.com/Africa-Data-Hub-107705861410896'}}><FontAwesomeIcon icon={faFacebookF} style={{ fontSize:"15px"}}/></Button>
                            <Button variant="white" onClick={() => { location.href='https://www.linkedin.com/company/africa-data-hub/about/?viewAsMember=true'}}><FontAwesomeIcon icon={faLinkedinIn} style={{ fontSize:"18px"}}/></Button>
                            <Button variant="white" onClick={() => { location.href='https://www.instagram.com/africadatahub/'}}><FontAwesomeIcon icon={faInstagram} style={{ fontSize:"18px"}}/></Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}