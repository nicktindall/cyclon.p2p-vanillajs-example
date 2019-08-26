
class StatsReporter {

    constructor(logger) {
        this.logger = logger;
        this.successfulShuffles=0;
        this.errorShuffles=0;
        this.timeoutShuffles=0;
    }
    
    logStats() {
        let totalShuffles = this.successfulShuffles + this.errorShuffles + this.timeoutShuffles;
        let successPct = ((this.successfulShuffles / totalShuffles) * 100).toFixed(0);
        let errorPct = ((this.errorShuffles / totalShuffles) * 100).toFixed(0);
        let timeoutPct = ((this.timeoutShuffles / totalShuffles) * 100).toFixed(0);
        this.logger.info(
`${totalShuffles} shuffles completed:
------------------------
${this.successfulShuffles} successful shuffles (${successPct}%)
${this.errorShuffles} errored shuffles (${errorPct}%)
${this.timeoutShuffles} timed out shuffles shuffles (${timeoutPct}%)`);
    }

    recordSuccesss() {
        this.successfulShuffles++;
        this.logStats();
    }
    
    recordError() {
        this.errorShuffles++;
        this.logStats();        
    }

    recordTimeout() {
        this.timeoutShuffles++;
        this.logStats();
    }
}

module.exports.StatsReporter = StatsReporter;