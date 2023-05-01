import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/database";
import "firebase/compat/auth";
import "firebase/messaging";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDMA8WmbQ18Y-0ta7HEw8gRJgSGuiwtm5I",
    authDomain: "burgle.firebaseapp.com",
    projectId: "burgle",
    storageBucket: "burgle.appspot.com",
    messagingSenderId: "738415556590",
    appId: "1:738415556590:web:f5ad80da789baa2e1280ff",
    measurementId: "G-VE9098LKZ1",
    databaseURL: "https://burgle-default-rtdb.asia-southeast1.firebasedatabase.app"
};

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const database = firebase.database();

export { db, storage, auth , database};