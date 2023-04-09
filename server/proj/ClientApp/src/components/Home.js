import React, { useEffect, useState, Component } from 'react';
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

    console.log(url);
    return (
        <div>
            <img src={ url }></img>
        </div>
    );
}

export default Home