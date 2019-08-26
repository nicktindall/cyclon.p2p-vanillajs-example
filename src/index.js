const CyclonCommon  = require("cyclon.p2p-common");
import { builder } from "cyclon.p2p";
import { RTC, SocketIOSignallingService, RedundantSignallingSocket, 
    StaticSignallingServerService, SocketFactory, SignallingServerSelector, 
    HttpRequestService, TimingService, ChannelFactory, PeerConnectionFactory,
    AdapterJsRTCObjectFactory } from "cyclon.p2p-rtc-client"
import { WebRTCComms, ShuffleStateFactory, SignallingServerBootstrap } from "cyclon.p2p-rtc-comms";

const SIGNALLING_SERVER_DELAY_BETWEEN_RETRIES=5000
const CHANNEL_STATE_TIMEOUT=3000
const ICE_SERVERS=[]
const SIGNALLING_SERVERS = [{
    "socket": {
        "server": "http://cyclon-js-ss-one.herokuapp.com"
    },
    "signallingApiBase": "http://cyclon-js-ss-one.herokuapp.com"
},
{
    "socket": {
        "server": "http://cyclon-js-ss-two.herokuapp.com"
    },
    "signallingApiBase": "http://cyclon-js-ss-two.herokuapp.com"
},
{
    "socket": {
        "server": "http://cyclon-js-ss-three.herokuapp.com"
    },
    "signallingApiBase": "http://cyclon-js-ss-three.herokuapp.com"
}]

CyclonCommon.consoleLogger().setLevelToDebug();

const signallingServerService = new StaticSignallingServerService(SIGNALLING_SERVERS);
const socketFactory = new SocketFactory();
const httpRequestService = new HttpRequestService();
const signallingServerSelector = new SignallingServerSelector(signallingServerService, localStorage, new TimingService(), SIGNALLING_SERVER_DELAY_BETWEEN_RETRIES);
const signallingSocket = new RedundantSignallingSocket(signallingServerService, socketFactory, CyclonCommon.consoleLogger(), CyclonCommon.asyncExecService(), signallingServerSelector);
const signallingService = new SocketIOSignallingService(signallingSocket, CyclonCommon.consoleLogger(), new HttpRequestService(), localStorage);
const peerConnectionFactory = new PeerConnectionFactory(new AdapterJsRTCObjectFactory(CyclonCommon.consoleLogger()), CyclonCommon.consoleLogger(), ICE_SERVERS, CHANNEL_STATE_TIMEOUT);
const channelFactory = new ChannelFactory(peerConnectionFactory, signallingService, CyclonCommon.consoleLogger());
const rtc = new RTC(signallingService, channelFactory);
const comms = new WebRTCComms(rtc, new ShuffleStateFactory(CyclonCommon.consoleLogger(), CyclonCommon.asyncExecService()), CyclonCommon.consoleLogger());

const cyclonNode = builder(comms, new SignallingServerBootstrap(signallingSocket, httpRequestService))
    .withStorage(localStorage)
    .withBootstrapSize(3)
    .build();

cyclonNode.start();
CyclonCommon.consoleLogger().debug("Started cyclon node, local ID is " + cyclonNode.getId());
