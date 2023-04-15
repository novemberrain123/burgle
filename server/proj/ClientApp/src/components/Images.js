import React, { useEffect, useState, Component } from 'react';
import { storage } from "../components/config/config";
import { getStorage, ref, getMetadata } from "firebase/storage";

const Images = () => {
    const [url, setUrl] = useState();
    const [metadata, setMetadata] = useState();
    useEffect(() => {
        const fetchImages = async () => {
            let result = await storage.ref().child("data").listAll();
            let urlPromises = result.items.map((imageRef) =>
                imageRef.getDownloadURL()
            );

            let metadataPromises = result.items.map((imageRef) =>
                imageRef.getMetadata()
            );
            return Promise.all(urlPromises.concat(metadataPromises));
        };
         
        const loadImages = async () => {
            var url = await fetchImages();
            var metadata = url.splice(url.length / 2);
            setUrl(url);
            setMetadata(metadata.map((item) => (new Date(item["updated"])).toString()));
        };
        loadImages();
    }, []);

    console.log(url);
    console.log(metadata);

    var imageDisplay = "Loading...";
    if (url != undefined) {
        //display images
        imageDisplay = url.map((image,idx) => {
            return (<div><img src={image} className="img-fluid img-thumbnail" alt="Loading..."></img><p>{metadata[idx]}</p></div>);
        });
    }
    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-6">
                    <p>All Images</p>
                    {imageDisplay}
                </div>
            </div>
        </div>
    );
}

export default Images
