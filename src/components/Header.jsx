import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebookF, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';


export class Header extends React.Component {
    constructor() {
        super();
        this.state = {
            show_menu: false
        }
    }

    componentDidMount() {

        var lastKnownScrollY = 0
        var currentScrollY = 0
        var ticking = false
        var idOfHeader = "headerMenu"
        var eleHeader = null
        const classes = {
            pinned: "header-pin",
            unpinned: "header-unpin",
        }
        function onScroll() {
            currentScrollY = window.pageYOffset
            requestTick()
        }
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(update)
            }
            ticking = true
        }
        function update() {
            if (currentScrollY < lastKnownScrollY) {
                pin()
            } else if (currentScrollY > lastKnownScrollY) {
                unpin()
            }
            lastKnownScrollY = currentScrollY
            ticking = false
        }
        function pin() {
            if (eleHeader.classList.contains(classes.unpinned)) {
                eleHeader.classList.remove(classes.unpinned)
                eleHeader.classList.add(classes.pinned)
            }
        }
        function unpin() {
            if (
                eleHeader.classList.contains(classes.pinned) ||
                !eleHeader.classList.contains(classes.unpinned)
            ) {
                eleHeader.classList.remove(classes.pinned)
                eleHeader.classList.add(classes.unpinned)
            }
        }
       
        eleHeader = document.getElementById(idOfHeader)
        document.addEventListener("scroll", onScroll, false)
       



        
       

    }

    componentDidUpdate() {
    }

    render() {
        let self = this;
        return (
            <div id="headerMenu" className="headerMenu bg-white shadow fixed-top py-3" style={{zIndex: '1054'}}>
                <Container>
                    <Row className="justify-content-between">
                        <Col>
                            <a href="#"><img src="./adh-logo.svg" style={{height: '45px'}}/></a>
                        </Col>
                        <Col xs="auto" className="navlinks d-none d-md-block">
                            <Button variant="white" onClick={() => { location.href='https://www.africadatahub.org/data-resources'}}>Data resources</Button>
                            <Button variant="white" onClick={() => { location.href='https://www.africadatahub.org/about'}}>About</Button>
                            <Button variant="white" onClick={() => { location.href='https://twitter.com/Africa_DataHub'}}><FontAwesomeIcon icon={faTwitter} style={{ fontSize:"18px"}}/></Button>
                            <Button variant="white" onClick={() => { location.href='https://www.facebook.com/Africa-Data-Hub-107705861410896'}}><FontAwesomeIcon icon={faFacebookF} style={{ fontSize:"15px"}}/></Button>
                            <Button variant="white" onClick={() => { location.href='https://www.linkedin.com/company/africa-data-hub/about/?viewAsMember=true'}}><FontAwesomeIcon icon={faLinkedinIn} style={{ fontSize:"18px"}}/></Button>
                            <Button variant="white" onClick={() => { location.href='https://www.instagram.com/africadatahub/'}}><FontAwesomeIcon icon={faInstagram} style={{ fontSize:"18px"}}/></Button>
                        </Col>
                        <Col xs="auto" className="d-md-none">
                            <Button variant="white" onClick={() => { this.setState({ show_menu: !this.state.show_menu }) }}>
                                <FontAwesomeIcon icon={faBars} color="#094151" style={{ fontSize:"18px"}}/>
                            </Button>
                        </Col>
                        <Offcanvas placement='top' backdropClassName='mobile_menu_bg' show={this.state.show_menu} onHide={() => this.setState({show_menu: false })} className="shadow" style={{backgroundColor: '#E7ECED', padding: '1em'}}>
                            <div className="mobile_menu_links">
                                <Button variant="white" onClick={() => { location.href='https://www.africadatahub.org/data-resources'}}>Data resources</Button>
                                <Button variant="white" onClick={() => { location.href='https://www.africadatahub.org/about'}}>About</Button>
                            </div>    
                            <div className="mobile_menu_social">
                                    <Button variant="white" onClick={() => { location.href='https://twitter.com/Africa_DataHub'}}><FontAwesomeIcon icon={faTwitter} style={{ fontSize:"18px"}}/></Button>
                                    <Button variant="white" onClick={() => { location.href='https://www.facebook.com/Africa-Data-Hub-107705861410896'}}><FontAwesomeIcon icon={faFacebookF} style={{ fontSize:"15px"}}/></Button>
                                    <Button variant="white" onClick={() => { location.href='https://www.linkedin.com/company/africa-data-hub/about/?viewAsMember=true'}}><FontAwesomeIcon icon={faLinkedinIn} style={{ fontSize:"18px"}}/></Button>
                                    <Button variant="white" onClick={() => { location.href='https://www.instagram.com/africadatahub/'}}><FontAwesomeIcon icon={faInstagram} style={{ fontSize:"18px"}}/></Button>
                            </div>
                        </Offcanvas>
                    </Row>
                </Container>
            </div>
        )
    }
}