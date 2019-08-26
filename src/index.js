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
        "server": "http://cyclon-js-ss-one.herokuapp.com:80"
    },
    "signallingApiBase": "http://cyclon-js-ss-one.herokuapp.com:80"
},
{
    "socket": {
        "server": "http://cyclon-js-ss-two.herokuapp.com:80"
    },
    "signallingApiBase": "http://cyclon-js-ss-two.herokuapp.com:80"
},
{
    "socket": {
        "server": "http://cyclon-js-ss-three.herokuapp.com:80"
    },
    "signallingApiBase": "http://cyclon-js-ss-three.herokuapp.com:80"
}]

const logger = CyclonCommon.consoleLogger();

/**
 * Set log level
 */
logger.setLevelToInfo(); // logger.setLevelToDebug() for more info

/**
 * Store state in sessionState so you can have different nodes in different tabs
 */
const storage = sessionStorage;

/**
 * Create and start the cyclon node
 */
const signallingServerService = new StaticSignallingServerService(SIGNALLING_SERVERS);
const socketFactory = new SocketFactory();
const httpRequestService = new HttpRequestService();
const signallingServerSelector = new SignallingServerSelector(signallingServerService, storage, new TimingService(), SIGNALLING_SERVER_DELAY_BETWEEN_RETRIES);
const signallingSocket = new RedundantSignallingSocket(signallingServerService, socketFactory, CyclonCommon.consoleLogger(), CyclonCommon.asyncExecService(), signallingServerSelector);
const signallingService = new SocketIOSignallingService(signallingSocket, CyclonCommon.consoleLogger(), new HttpRequestService(), storage);
const peerConnectionFactory = new PeerConnectionFactory(new AdapterJsRTCObjectFactory(CyclonCommon.consoleLogger()), CyclonCommon.consoleLogger(), ICE_SERVERS, CHANNEL_STATE_TIMEOUT);
const channelFactory = new ChannelFactory(peerConnectionFactory, signallingService, CyclonCommon.consoleLogger());
const rtc = new RTC(signallingService, channelFactory);
const comms = new WebRTCComms(rtc, new ShuffleStateFactory(CyclonCommon.consoleLogger(), CyclonCommon.asyncExecService()), CyclonCommon.consoleLogger());

const cyclonNode = builder(comms, new SignallingServerBootstrap(signallingSocket, httpRequestService))
    .withStorage(storage)
    .build();

cyclonNode.start();
logger.info("Started cyclon node, local ID is " + cyclonNode.getId());

/**
 * Log stats when shuffles are completed
 */
let successfulShuffles=0, errorShuffles=0, timeoutShuffles=0, totalShuffles=0;
function logStats() {
    let totalShuffles = successfulShuffles + errorShuffles + timeoutShuffles;
    let successPct = ((successfulShuffles / totalShuffles) * 100).toFixed(0);
    let errorPct = ((errorShuffles / totalShuffles) * 100).toFixed(0);
    let timeoutPct = ((timeoutShuffles / totalShuffles) * 100).toFixed(0);
    logger.info(
        `${totalShuffles} shuffles completed:
------------------------
${successfulShuffles} successful shuffles (${successPct}%)
${errorShuffles} errored shuffles (${errorPct}%)
${timeoutShuffles} timed out shuffles shuffles (${timeoutPct}%)`);
}

cyclonNode.on("shuffleCompleted", () => {
    successfulShuffles++;
    logStats();
});
cyclonNode.on("shuffleError", () => {
    errorShuffles++;
    logStats();
});
cyclonNode.on("shuffleTimeout", () => {
    timeoutShuffles++;
    logStats();
});

