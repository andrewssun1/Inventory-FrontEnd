var React = require('react');
import {Carousel, Col } from 'react-bootstrap';

export default class AboutPage extends React.Component {
    render(){
        return(
            <Col md={8} xsOffset={2}>
                <Carousel>
                    <Carousel.Item>
                        <img width={900} height={500} alt="goodberrys_social" src="https://s3-us-west-2.amazonaws.com/neshsolutionswebpage/group.jpg"/>
                        <Carousel.Caption>
                            <h3>Goodberrys Socials</h3>
                            <p>Getting Goodberrys after Evolution 3</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img width={900} height={500} alt="900x500" src="https://s3-us-west-2.amazonaws.com/neshsolutionswebpage/ankit.jpg"/>
                        <Carousel.Caption>
                            <h3>Ankit Kayastha</h3>
                            <p>My name is Ankit Kayastha and I’m valedictorian at Hunterdon Central Regional High School located in central Jersey.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img width={900} height={500} alt="900x500" src="https://s3-us-west-2.amazonaws.com/neshsolutionswebpage/sivaL.png"/>
                        <Carousel.Caption>
                            <h3>Siva Loganathan</h3>
                            <p>Tru Heem Naw Meen Lit Savage</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img width={900} height={500} alt="900x500" src="https://s3-us-west-2.amazonaws.com/neshsolutionswebpage/andrew.jpg"/>
                        <Carousel.Caption>
                            <h3>Andrew Sun</h3>
                            <p>Ooooooo Baby!</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img width={900} height={500} alt="900x500" src="https://s3-us-west-2.amazonaws.com/neshsolutionswebpage/patrick.jpg"/>
                        <Carousel.Caption>
                            <h3>Patrick Terry</h3>
                            <p>*Slaps himself HARD*</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </Col>
        );
    }


}
