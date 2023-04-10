import React, { useEffect, useState, Component } from 'react';
import { storage } from "../components/config/config";


const Images = () => {
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
            setUrl(url);
        };
        loadImages();
    }, []);
    console.log(url);
    return (
        <div className="container">
            <div className="row">
                <div className="col-sm">
                    <p>Images</p>
                    <img src={url}></img>
                </div>
            </div>
        </div>
    );
}

export default Images
