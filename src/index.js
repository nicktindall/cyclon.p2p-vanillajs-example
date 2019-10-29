import {commsAndBootstrapBuilder} from "cyclon.p2p-rtc-comms";
import {builder} from "cyclon.p2p";
import {StatsReporter} from "./StatsReporter";
import {consoleLogger} from "cyclon.p2p-common";

const logger = consoleLogger();

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
const {comms, bootstrap} = commsAndBootstrapBuilder()
    .withStorage(storage)
    .withLogger(logger)
    .joiningRooms(['CyclonP2P_vanillaJS_example'])
    .build();

const cyclonNode = builder(comms, bootstrap)
    .withStorage(storage)
    .withLogger(logger)
    .build();

cyclonNode.start();
logger.info("Started cyclon node, local ID is " + cyclonNode.getId());

/**
 * Log stats when shuffles are completed
 */
let statsReporter = new StatsReporter(logger);
cyclonNode.on("shuffleCompleted", () => {
    statsReporter.recordSuccesss();
});
cyclonNode.on("shuffleError", () => {
    statsReporter.recordError();
});
cyclonNode.on("shuffleTimeout", () => {
    statsReporter.recordTimeout();
});

/**
 * Log changes to the neighbour set
 */
let neighbourSet = cyclonNode.getNeighbourSet();
neighbourSet.on("change", (type, value) => {
    switch (type) {
        case 'update':
            logger.info(`the pointer for node ${value.id} was updated`);
            break;
        case 'insert':
            logger.info(`${value.id} was inserted into the neighbour set`);
            break;
        case 'remove':
            logger.info(`${value.id} was removed from the neighbour set`)
    }
    logger.info(`IDs in neighbourset are ${JSON.stringify(Array.from(neighbourSet.getContents().keys()))}`)
});
