import React, { useEffect, useState, Component } from 'react';
import { Route, useNavigate } from 'react-router-dom';
import { storage } from "../components/config/config";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend} from "recharts";
import moment from "moment";
const Home = () => {
    const [url, setUrl] = useState();
    const [curSensorVal, setCurSensorVal] = useState();
    const [defSensorVal, setDefSensorVal] = useState();
    const [curData, setData] = useState([]);
    const [finalData, setFinalData] = useState([]);
    const [hasData, setHasData] = useState(false);
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

        fetch("home/data")         
            .then(response => response.json())
            .then(data => {
                setData(data);
            })
    }, []);

    useEffect(() => {
        let dataFinal = []
        for (let i = 0; i < curData.length; i++) {
            let point = {}
            point["x"] = moment(curData[i][1]).valueOf();
            point["y"] = parseFloat(curData[i][0]);
            dataFinal.push(point);
        }
        setFinalData(dataFinal);

        if (dataFinal.length != 0) {
            setHasData(true);
        }
    }, [curData]);

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

    const dateFormatter = date => {
        // return moment(date).unix();
        return moment(date).format('HH:mm:ss');
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm">
                    <h3>Latest Image</h3>
                    <img src={url} className="img-fluid"></img>
                    <button className="px-4" onClick={routeChange}>More</button>
                </div>
                <div className="col-sm">
                    <h3>Settings</h3>
                    <form method="post" onSubmit={handleSubmit}>
                        <label>
                            Current Sensor1 Threshold (cm): <input type="number" name="threshold" step="0.01" value={curSensorVal} onChange={handleInputChange} min="5" max="50"/>
                        </label>
                        <input type="submit" value="New Threshold"/>
                    </form>
                </div>
            </div>
            {hasData && (
                <div className="row">
                    <h3>Sensor 1 last 15 minutes</h3>
                    <LineChart width={1400} height={300} data={finalData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="x" domain={[finalData[0].x, finalData[finalData.length - 1].x]} scale="time" type="number" tickFormatter={dateFormatter} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="y" stroke="#8884d8" />
                    </LineChart>
                </div>
            )}
        </div>
    );
}

export default Home