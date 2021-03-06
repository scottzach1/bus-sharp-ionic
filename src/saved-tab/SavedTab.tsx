import React, {FC} from "react";
import {IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import MetlinkSavedServiceList from "./MetlinkSavedServiceList";
import MetlinkSavedStopList from "./MetlinkSavedStopList";

const SavedTab: FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton/>
                    </IonButtons>
                    <IonTitle>Saved</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Saved</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <MetlinkSavedStopList/>
                <MetlinkSavedServiceList/>
            </IonContent>
        </IonPage>
    )
}

export default SavedTab;
