import {Plugins} from "@capacitor/core";
import {readRemoteFile} from "react-papaparse";
import firebase from "firebase";
import {getUserDocument, updateUserDocument} from "./Firebase";

const {Storage} = Plugins;

/* Initialisation Methods */

/**
 * Initialises the saved stops within local storage. If there is no array, then this function
 * will initialise it with an empty array.
 */
export const initSavedStops = async () => {
    Storage.get({key: 'savedStops'}).then((res) => {
        if (!res.value) Storage.set({key: 'savedStops', value: JSON.stringify([])})
    }).catch(e => console.error(e));
}

/**
 * Initialises the saved external within local storage. If there is no array, then this function
 * will initialise it with an empty array.
 */
export const initSavedServices = async () => {
    Storage.get({key: 'savedServices'}).then((res) => {
        if (!res.value) Storage.set({key: 'savedServices', value: JSON.stringify([])}).then()
    }).catch((e) => console.error(e));
}

const proxy = "https://cors-anywhere.herokuapp.com/";

/**
 * Initialises the stop data within local storage. If there is no array, then this function
 * will initialise it with the latest pull of stop data from the transit-feeds website.
 */
export const initStops = async () => {
    Storage.get({key: 'stops'}).then((res) => {
        const url = "data/stops.txt";
        // const url = "http://transitfeeds.com/p/metlink/22/latest/download/stops.txt";
        if (!res.value) readRemoteFile(url, {
            download: true, header: true,
            complete: async (results: any) => {
                let stopData: any = {};

                for (const stopEntry of results.data)
                    stopData[stopEntry.stop_id] = stopEntry;

                Storage.set({key: 'stops', value: JSON.stringify(stopData)})
                    .catch((e) => console.error(e));
            }
        })
    }).catch(e => console.error('Failed to initialise stops', e));
}

/**
 * Initialises the service data within local storage. If there is no array, then this function
 * will initialise it with the latest pull of stop data from the transit-feeds website.
 */
export const initServices = async () => {
    // const url = "http://transitfeeds.com/p/metlink/22/latest/download/routes.txt";
    const url = "data/routes.txt";
    Storage.get({key: 'services'}).then((res) => {
        if (!res.value) readRemoteFile(url, {
            download: true, header: true,
            complete: async (results: any) => {
                let serviceData: any = {};

                for (const serviceEntry of results.data)
                    serviceData[serviceEntry.route_short_name] = serviceEntry;

                Storage.set({key: 'services', value: JSON.stringify(serviceData)})
                    .catch((e) => console.error(e));
            }
        })
    }).catch(e => console.error('Failed to initialise external', e));
}


/* Fetcher Methods */

/**
 * Fetches the stop times for a given stop code. The fetched data will also be cached within the
 * local storage. If the function fails to fetch the fresh data, then the error will be propagated
 * into the `StorageResponse`. Additionally, if the requested data has been cached locally, then
 * this information will also be returned within the `StorageResponse`.
 *
 * @param stopCode: of the stop to search.
 * @return response containing success / failure as well as any relevant errors or data.
 */
export const fetchStopTimes = async (stopCode: string): Promise<StorageResponse> => {
    try {
        // Download Stop Timetable
        const url = 'https://www.metlink.org.nz/api/v1/StopDepartures/';

        return new StorageResponse(true, null,
            await fetch(proxy + url + stopCode)
                .then((resp) => {
                    if (resp.ok) return Promise.resolve(resp.json());
                    else throw TypeError('Request returned bad response: ' + resp.statusText);
                })
                .then((data) => {
                    if (!data) throw TypeError('Could not parse response!');
                    setStopTimes(stopCode, data);
                    return data;
                })
        );
    } catch (error) {
        // Search Data Locally
        return new StorageResponse(false, error.message,
            await Storage.get({key: 'stopTimes'})
                .then((res) => {
                    if (res.value) return JSON.parse(res.value)[stopCode];
                    else return null;
                })
                .catch(() => null)
        );
    }
}

/**
 * Fetches the service routes for a given service code. The fetched data will also be cached within
 * the local storage. If the function fails to fetch the fresh data, then the error will be propagated
 * into the `StorageResponse`. Additionally, if the requested data has been cached locally, then
 * this information will also be returned within the `StorageResponse`.
 *
 * @param serviceCode: of the service to search.
 * @return response containing success / failure as well as any relevant errors or data.
 */
export const fetchServiceRoutes = async (serviceCode: string): Promise<StorageResponse> => {
    try {
        // Download Service Routes
        const url = "https://www.metlink.org.nz/api/v1/ServiceMap/";

        return new StorageResponse(true, null,
            await fetch(proxy + url + serviceCode)
                .then((resp) => {
                    if (resp.ok) return Promise.resolve(resp.json());
                    else throw TypeError('Request returned bad response!');
                })
                .then((data) => {
                    if (!data) throw TypeError('Could not parse response!');
                    setServiceRoutes(serviceCode, data);
                    return data;
                })
        );
    } catch (error) {
        // Search Data Locally
        return new StorageResponse(false, error.message,
            await Storage.get({key: 'serviceRoutes'})
                .then((res) => {
                    if (res.value) return JSON.parse(res.value)[serviceCode];
                    else return null;
                })
                .catch(() => null)
        );
    }
}

/**
 * Initialises the user theme within local storage if not set. This will default to 'auto'.
 */
export const initTheme = async () => {
    Storage.get({key: 'theme'}).then((res) => {
        if (!res.value) Storage.set({key: 'theme', value: JSON.stringify("auto")}).then()
    });
}

/* Getter Methods */


/**
 * Gets and parses the saved stops from within the Local storage.
 *
 * @return string[]: Saved stops from within Local storage.
 */
export const getSavedStops = async () => {
    return Storage.get({key: 'savedStops'})
        .then((stopData) => JSON.parse(stopData.value!))
        .catch((e) => {
            console.error('Failed to get stop data', e);
            return null;
        });
}

/**
 * Gets and parses the saved external from within the local storage.
 *
 * @return any[]: Saved external from within Local storage.
 */
export const getSavedServices = async () => {
    return Storage.get({key: 'savedServices'})
        .then((serviceData) => JSON.parse(serviceData.value!))
        .catch((e) => {
            console.error('Failed to get service data', e);
            return null;
        });
}

/**
 * Gets and parses the stop data from within the local storage.
 *
 * @return any[]: Stop data saved within Local storage.
 */
export const getStops = async () => {
    return Storage.get({key: 'stops'})
        .then((stopData) => JSON.parse(stopData.value!))
        .catch((e) => {
            console.error('Failed to get stop data', e);
            return null;
        });
}

/**
 * Gets and parses the service data from within the local storage.
 *
 * @return any[]: Service data saved within Local storage.
 */
export const getServices = async () => {
    return Storage.get({key: 'services'})
        .then((serviceData) => JSON.parse(serviceData.value!))
        .catch((e) => {
            console.error('Failed to get service data', e);
            return null;
        });
}

/* Setter Methods */

/**
 * Updates the saved stops data within the Local storage. Will also update the document within
 * Firestore if user parameter is present.
 *
 * @param savedStops: Stops to save to local storage.
 * @param user?: Optionally user reference to save in Firestore.
 */
export const setSavedStops = async (savedStops: any, user?: firebase.User) => {
    Storage.set({
        key: 'savedStops',
        value: JSON.stringify(savedStops)
    }).then(() => {
        if (user) updateUserDocument(user, {savedStops: JSON.stringify(savedStops)});
    }).catch((e) => console.error('Failed to save stop data', e))
}

/**
 * Updates the saved external data within the Local storage. Will also update the document within
 * Firestore if user parameter is present.
 *
 * @param savedServices: Services to save to local storage.
 * @param user?: Optionally user reference to save in Firestore.
 */
export const setSavedServices = async (savedServices: any, user?: firebase.User) => {
    Storage.set({
        key: 'savedServices',
        value: JSON.stringify(savedServices)
    }).then(() => {
        if (user) updateUserDocument(user, {savedServices: JSON.stringify(savedServices)});
    }).catch((e) => console.error('Failed to save service data', e));
}

/**
 * Updates a selected stops most recently cached data with some more recent data. This will be updated
 * within the browsers local storage.
 *
 * @param stopCode: of the stop to update cached data.
 * @param data: to store in the cache.
 */
export const setStopTimes = async (stopCode: string, data: any) => {
    Storage.get({key: 'stopTimes'})
        .then((res) => {
            // Get or init value
            let allData: any = (res.value) ? JSON.parse(res.value) : {};
            // Update with latest times.
            allData[stopCode] = data;
            // Store new values.
            Storage.set({
                key: 'stopTimes',
                value: JSON.stringify(allData),
            }).catch((e) => console.error('Failed to locally save service routes', e));
        });
}


/**
 * Updates a selected external most recently cached data with some more recent data. This will be
 * updated within the browsers local storage.
 *
 * @param serviceCode: of the service to update cached data.
 * @param data: to store in the cache.
 */
export const setServiceRoutes = async (serviceCode: string, data: any) => {
    Storage.get({key: 'serviceRoutes'})
        .then((res) => {
            // Get or init value
            let allData: any = (res.value) ? JSON.parse(res.value) : {};
            // Update with latest route.
            allData[serviceCode] = data;
            // Store new values.
            Storage.set({
                key: 'serviceRoutes',
                value: JSON.stringify(allData),
            }).catch((e) => console.error('Failed to locally save service routes', e));
        });
}

/**
 * Clears the saved stop and service data within the Local storage. Will also clear the stop and
 * service data within Firestore if the user parameter is present.
 *
 * @param user?: Optionally a user reference to update Firestore.
 */
export const clearSavedData = async (user?: firebase.User) => {
    setSavedStops([]).then(() => setSavedServices([]))
    if (user && user.uid) updateUserDocument(user, {
        savedStops: JSON.stringify([]),
        savedServices: JSON.stringify([]),
    }).catch((e) => console.log('Failed to clear cloud data', e));
}

/**
 * Toggles a saved stop within the saved stops in Local storage. Will add the stopCode to the saved
 * stops list if it isn't present, or will remove from the list otherwise. Will also update the
 * document within Firestore if user parameter is present.
 *
 * @param stopCode: Code to toggle within the Local storage.
 * @param user?: Optionally a user reference to update Firestore.
 * @return boolean: `true` if added, `false` otherwise.
 */
export const toggleSavedStop = async (stopCode: string, user?: firebase.User) => {
    return getSavedStops().then((savedStops) => {
        // Remove from saved stops.
        if (savedStops.includes(stopCode))
            savedStops.splice(savedStops.indexOf(stopCode), 1);
        // Add to saved stops.
        else
            savedStops.push(stopCode);
        // Update Storage.
        setSavedStops(savedStops);

        // Update Firestore
        if (user) updateUserDocument(user, {savedStops: JSON.stringify(savedStops)})
            .catch((e) => console.error("Couldn't backup to cloud", e))

        return savedStops.includes(stopCode);
    });
}

/**
 * Toggles a saved service within the saved external in Local storage. Will add the serviceCode to
 * the saved external list if it isn't present, or will remove from the list otherwise. Will also
 * update the document within Firestore if user parameter is present.
 *
 * @param serviceCode: Code to toggle within the Local storage.
 * @param user?: Optionally a user reference to update Firestore.
 * @return boolean: `true` if added, `false` otherwise.
 */
export const toggleSavedService = async (serviceCode: string, user?: firebase.User) => {
    return getSavedServices().then((savedServices) => {
        // Remove from saved stops.
        if (savedServices.includes(serviceCode))
            savedServices.splice(savedServices.indexOf(serviceCode), 1);
        // Add to saved stops.
        else
            savedServices.push(serviceCode);
        // Update Storage.
        setSavedServices(savedServices);

        // Update Firestore
        if (user) updateUserDocument(user, {savedServices: JSON.stringify(savedServices)})
            .catch((e) => console.error("Couldn't backup to cloud", e))

        return savedServices.includes(serviceCode);
    });
}

/* Firestore Syncing (Merge local and cloud storage). */

/**
 * Syncs the Local storage with the user document within firestore. This sync uses an inclusive merge
 * based approach where both lists will be joined. (Ie, even if the user cleared the code locally,
 * it will be re-synced back into local storage if it is present within the users document in firestore).
 *
 * @param user: User reference to sync with Local storage.
 */
export const syncSavedData = async (user: firebase.User | null) => {
    if (user && user.uid) getUserDocument(user).then(async (doc) => {
        // Merge Saved Stops
        let savedStopsSet = new Set(await getSavedStops());
        if (doc && 'savedStops' in doc)
            JSON.parse(doc['savedStops']).forEach(savedStopsSet.add, savedStopsSet);

        // Merge Saved Services
        let savedServicesSet = new Set(await getSavedServices());
        if (doc && 'savedServices' in doc)
            JSON.parse(doc['savedServices']).forEach(savedServicesSet.add, savedServicesSet);

        // Convert to distinct arrays.
        let savedStopsArray = Array.from(savedStopsSet);
        let savedServicesArray = Array.from(savedServicesSet);

        // Update both locations.
        await setSavedStops(savedStopsArray);
        await setSavedServices(savedServicesArray);
        await updateUserDocument(user, {
            savedStops: JSON.stringify(savedStopsArray),
            savedServices: JSON.stringify(savedServicesArray),
        })
    });
}

/**
 * Describes the return type of requests.
 */
class StorageResponse {
    public success: boolean;
    public errorMessage: string | null;
    public data: null | any;

    /**
     * Describes the return type of requests.
     *
     * @param success: `true` if successful, `false` otherwise.
     * @param errorMessage: (Optional) to notify user.
     * @param data: (Optional) the returned data.
     */
    constructor(success: boolean, errorMessage?: string | null, data?: string | null) {
        this.success = success;
        this.errorMessage = (errorMessage) ? errorMessage : null;
        this.data = (data) ? data : null;
    }
}
