import * as config from "config";

interface IConfig {
    homeserverUrl: string;
    accessToken: string;
    autoJoin: boolean;
    dataPath: string;
    pollbot: string;
}

export default <IConfig>config;
