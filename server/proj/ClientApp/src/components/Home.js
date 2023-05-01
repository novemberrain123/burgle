import React, { useEffect, useState, Component } from 'react';
import { Route, useNavigate } from 'react-router-dom';
import { storage, database } from "../components/config/config";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";
import $, { data } from 'jquery';
import './styless.css'

const Home = () => {
    const [url, setUrl] = useState();
    const [curSensorVal, setCurSensorVal] = useState();
    const [defSensorVal, setDefSensorVal] = useState();
    const [curData, setData] = useState([]);
    const [finalData, setFinalData] = useState([]);
    const [hasData, setHasData] = useState(false);
    
    const CloseButton = ({ closeToast }) => (
        <i
            className="material-icons"
            onClick={closeToast}
        >
            x
        </i>
    );
    function CustomToast({ message, closeToast }) {
        const handleYes = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, 300000); // set a timeout of 5 seconds

            try {
                $("#loader").css('display', 'block')
                const response = await fetch('home/intrusion', {
                    signal: controller.signal,
                });
                var body = await response.json();
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request timed out');
                } else {
                    console.log('An error occurred', error);
                }
            } finally {
                clearTimeout(timeout);
            }
            $("#loader").css('display', 'none');
            var stolen
            database.ref('stolen').once('value', snapshot => {
                stolen = snapshot.val();
            });
            database.ref('similarity_url').once('value', snapshot => {
                const imageUrl = snapshot.val();
                toast(
                    <div >
                        <p>IT IS {stolen} AN ITEM WAS STOLEN</p>
                        <img src={imageUrl} className="img-fluid" alt="Image" />
                    </div>
                    , { autoClose: false, closeButton: true, style: { width: '500px' } });
            });

            database.ref('intrusion').set(0);
        };

        return (
            <div style={{ alignItems: 'center' }}>
                <h1 style={{ margin: '0' }}>{message}</h1>
                <p>Would you like to check if items were stolen?</p>
                <button onClick={handleYes} style={{ marginLeft: '10px' }}>Yes</button>
            </div>
        );
    }

    const handleCloseToast = () => {
        database.ref('intrusion').set(0);

        toast.dismiss();
    };
    
    

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
            });

        const dbRef = database.ref('intrusion');
        dbRef.on('value', snapshot => {
            const intrusionValue = snapshot.val();
            console.log('Intrusion value is: ', intrusionValue);
            if (intrusionValue == 1) {
                toast.warning(
                    <CustomToast message={`INTRUSION OCCURED!`} />,
                    { autoClose: false, closeButton: <button onClick={handleCloseToast}>x</button> }
                );
            }
        });


        return () => dbRef.off('intrusion');


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
        return moment(date).format('HH:mm:ss');
    };

    return (
        <div className="container">
            <ToastContainer closeButton={CloseButton} position="top-center"
                style={{ marginTop: '50px' }} />
            <div id="loader" className="spinner-border overlapping-div" role="status" style={{ display: 'none'}}>
            </div>
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
                        <XAxis dataKey="x" domain={[finalData[0].x, finalData[finalData.length - 1].x]} scale="time" type="number" angle="-15" tickFormatter={dateFormatter} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="y" stroke="#8884d8" />
                    </LineChart>
                </div>
            )}
        </div>
    );
}

export default Home