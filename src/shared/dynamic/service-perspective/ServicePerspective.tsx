import React, {FC, useState} from "react";
import {
    IonCard,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import MetlinkServiceView from "./MetlinkServiceView";
import MetlinkServiceInfo from "./MetlinkServiceInfo";
import BackButton from "../../static/ui/BackButton";
import {ellipsisVerticalSharp} from "ionicons/icons";
import "./ServicePerspective.css";

const ServicePerspective: FC<any> = ({match}) => {
    const [showCard, setShowCard] = useState<boolean>(true)
    const {params: {serviceCode}} = match

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <BackButton/>
                    <IonTitle slot={"start"}>Service: {serviceCode}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent scrollX={false} scrollY={false}>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Map</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <MetlinkServiceView serviceCode={serviceCode}/>
                <div>
                    <IonFab horizontal={"end"} itemID={"service-info-fab"}>
                        <IonFabButton onClick={() => setShowCard(!showCard)} size={"small"} activated={showCard}>
                            <IonIcon icon={ellipsisVerticalSharp}/>
                        </IonFabButton>
                    </IonFab>
                    {!showCard && <IonCard/>} {/* Fore the Fab into a fixed location. */}
                    {showCard && (<MetlinkServiceInfo serviceCode={serviceCode}/>)}
                </div>
            </IonContent>
        </IonPage>)
}

export default ServicePerspective
