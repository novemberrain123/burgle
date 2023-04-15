import React, { useEffect, useState, Component } from 'react';
import { Route, useNavigate } from 'react-router-dom';
import { storage } from "../components/config/config";


const Home = () => {
    const [error, setError] = useState();
    const [url, setUrl] = useState();
    const [curSensorVal, setCurSensorVal] = useState(0);
    var xd;
    useEffect(() => {
        //let r = await fetch("/getSensor");
        //let buff = await r.arrayBuffer();
        //let decoder = new TextDecoder('utf-16');
        //let val = JSON.parse(decoder.decode(buff));
        //setCurSensorVal(val);
        fetch("/getSensor") //TODO why wont it work!!
            .then((response) => response.arrayBuffer())
            .then((buffer) => new TextDecoder("utf-16").decode(buffer))
            .then((response) => JSON.parse(response))
            .then(
                (result) => {
                    setCurSensorVal(result);
                },
                (error) => {
                    setError(error);
                }
        )

        const fetchImages = async () => {
            let result = await storage.ref().child("data").listAll();
            let urlPromises = result.items.map((imageRef) =>
                imageRef.getDownloadURL()
            );

            return Promise.all(urlPromises);
        };
        
        const loadImages = async () => {
            var url = await fetchImages();
            setUrl(url.at(-1));
        };
        loadImages();
    }, []);

    //more button to images page
    let navigate = useNavigate();
    const routeChange = () => {
        let path = `images`;
        navigate(path);
    }

    //submit new sensor threshold
    const handleSubmit = () => {

    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm">
                    <p>Latest Image</p>
                    <img src={url} className="img-fluid"></img>
                    <button className="px-4" onClick={routeChange}>More</button>
                </div>
                <div className="col-sm">
                    <p>Settings</p>
                    <form method="post" onSubmit={handleSubmit}>
                        <label>
                            Ultrasonic Sensor Threshold: <input type="number" name="input1" defaultValue={curSensorVal} />
                        </label>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Home