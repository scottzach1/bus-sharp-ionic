import 'fetch';
import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/react';
import {mapSharp, saveSharp, searchCircleSharp, settingsSharp} from 'ionicons/icons';
import SearchTab from './pages/SearchTab';
import MapTab from './pages/MapTab';
import SavedTab from './pages/SavedTab';
import SettingsTab from './pages/SettingsTab';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import './theme/variables.css';
import StopPerspective from "./pages/StopPerspective";
import ServicePerspective from "./pages/ServicePerspective";
import {IonReactRouter} from "@ionic/react-router";
import {UserContext} from "./providers/UserProvider";
import AccountInfoPerspective from "./pages/AccountInfoPerspective";
import AccountLoginPerspective from "./pages/AccountLoginPerspective";
import AccountSignupPerspective from "./pages/AccountSignupPerspective";
import TwitterFeedPerspective from "./pages/TwitterFeedPerspective";
import AccountPasswordResetPerspective from "./pages/AccountPasswordResetPerspective";

class Application extends React.Component<{}, {}> {
    static contextType = UserContext;

    render() {
        return (
            <UserContext.Consumer>
                {(userContext) => (
                    <IonApp>
                        <IonReactRouter>
                            <IonTabs>
                                <IonRouterOutlet>
                                    {/* Home */}
                                    <Route path="/" render={() => <Redirect to="/search"/>} exact={true}/>

                                    {/* Tabs */}
                                    <Route path="/search" component={SearchTab}/>
                                    <Route path="/map" component={MapTab}/>
                                    <Route path="/saved" component={SavedTab}/>
                                    <Route path="/settings" component={SettingsTab}/>

                                    {/* Hidden Perspectives*/}
                                    <Route path="/service/:serviceCode" component={ServicePerspective}/>
                                    <Route path="/stop/:stopCode" component={StopPerspective}/>
                                    <Route path="/twitter" component={TwitterFeedPerspective}/>

                                    {/*Account Perspectives*/}
                                    {userContext?.uid ?
                                        <Route path={"/account"} component={AccountInfoPerspective}/> :
                                        <Redirect from={"/account"} to={"/login"}/>
                                    }
                                    {!userContext?.uid ?
                                        <Route path={"/reset"} component={AccountPasswordResetPerspective}/> :
                                        <Redirect from={"/reset"} to={"/login"}/>
                                    }
                                    {!userContext?.uid ?
                                        <Route path={"/login"} component={AccountLoginPerspective}/> :
                                        <Redirect from={"/login"} to={"/account"}/>
                                    }
                                    {!userContext?.uid ?
                                        <Route path={"/signup"} component={AccountSignupPerspective}/> :
                                        <Redirect from={"/signup"} to={"account"}/>
                                    }
                                </IonRouterOutlet>
                                <IonTabBar slot="bottom">
                                    <IonTabButton tab="search" href="/search">
                                        <IonIcon icon={searchCircleSharp}/>
                                        <IonLabel>Search</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="map" href="/map">
                                        <IonIcon icon={mapSharp}/>
                                        <IonLabel>Map</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="saved" href="/saved">
                                        <IonIcon icon={saveSharp}/>
                                        <IonLabel>Saved</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="settings" href="/settings">
                                        <IonIcon icon={settingsSharp}/>
                                        <IonLabel>Settings</IonLabel>
                                    </IonTabButton>
                                </IonTabBar>
                            </IonTabs>
                        </IonReactRouter>
                    </IonApp>
                )}
            </UserContext.Consumer>
        );
    }
}

export default Application;
