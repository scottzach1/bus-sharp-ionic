import React, {FC, useState} from 'react';
import {
    GoogleMap,
    useLoadScript,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";

interface Props {
    serviceCode: string;
}

const libraries = ["places"];
const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
};
const center = {
    lat: -41.286461,
    lng: 174.776230,
}

const MetlinkServiceView: FC<Props> = ({serviceCode}) => {
    const [serviceData, setServiceData] = useState<any>();

    const {isLoaded, loadError} = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    })

    if (loadError) return (<p>"Error: load error"</p>)
    if (!isLoaded) return (<p>"Error: not loaded"</p>)

    return (
        <div>
            <p>Service Code: {serviceCode}</p>
            <GoogleMap mapContainerStyle={mapContainerStyle} zoom={8} center={center} />
        </div>
    )
};

export default MetlinkServiceView;