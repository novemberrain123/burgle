import React, { useEffect, useState, Component } from 'react';
import { Route, useNavigate } from 'react-router-dom';
import { storage } from "../components/config/config";


const Home = () => {
    const [url, setUrl] = useState();
    const [curSensorVal, setCurSensorVal] = useState();
    const [defSensorVal, setDefSensorVal] = useState();
    useEffect(() => {
        fetch('home')
            .then(response => response.json())
            .then(data => {
                setCurSensorVal(data);
                setDefSensorVal(data);
            })

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

    async function postData(url = "", data = {}) {
        const response = await fetch(url, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data), 
        });
        return response;
    }

    //submit new sensor threshold
    const handleSubmit = (event) => {
        event.preventDefault();
        postData('home', { curSensorVal })
            .then((response) => {
                if (response.status == "200") {
                    setDefSensorVal(curSensorVal);
                    window.alert("Threshold changed to " + curSensorVal );
                }
                else {
                    setCurSensorVal(defSensorVal);
                    window.alert("Failed to change threshold.");
                }
        })
    }

    const handleInputChange = (event) => {
        event.persist();
        setCurSensorVal((values) => event.target.value);
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
                            Current Sensor Threshold (cm): <input type="number" name="threshold" step="0.01" value={curSensorVal} onChange={handleInputChange} min="5" max="50"/>
                        </label>
                        <input type="submit" value="New Threshold"/>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Home