/*
 * WHALE IN SPACE | NASA SPACE APPS COVID-19 CHALLENGE
 * Copyright (c) 2020 by SilentByte <https://silentbyte.com/>
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

export const FIREBASE_CONFIG = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(FIREBASE_CONFIG);
firebase.auth().useDeviceLanguage();

export const auth = firebase.auth();
export const db = firebase.firestore();

export import DocumentData = firebase.firestore.DocumentData;
export import DocumentSnapshot = firebase.firestore.DocumentSnapshot;
export import Timestamp = firebase.firestore.Timestamp;
export import FieldValue = firebase.firestore.FieldValue;
