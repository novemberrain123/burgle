import React, { useEffect, useState, Component } from 'react';
import { Route, useNavigate } from 'react-router-dom';
import { storage } from "../components/config/config";


const Home = () => {
    const [url, setUrl] = useState();

    useEffect(() => {
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

    let navigate = useNavigate();
    const routeChange = () => {
        let path = `images`;
        navigate(path);
    }
    return (
        <div className="container">
            <div className="row">
                <div className="col-sm">
                    <p>Latest Image</p>
                    <img src={url}></img>
                    <button className="px-4" onClick={routeChange}>More</button>
                </div>
            </div>
        </div>
    );
}

export default Home