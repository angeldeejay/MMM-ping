/**
 * @file node_helper.js
 *
 * @author fewieden
 * @license MIT
 *
 * @see  https://github.com/fewieden/MMM-ping
 */

/**
 * @external node_helper
 * @see https://github.com/MichMich/MagicMirror/blob/master/modules/node_modules/node_helper/index.js
 */
const NodeHelper = require("node_helper");

/**
 * @external ping
 * @see https://www.npmjs.com/package/ping
 */
const ping = require("ping");

/**
 * @external Log
 */
const Log = require("../../js/logger.js");

/**
 * @module node_helper
 * @description Backend for the module to ping hosts.
 *
 * @requires external:ping
 * @requires external:node_helper
 */
module.exports = NodeHelper.create({
    /**
     * @function socketNotificationReceived
     * @description Receives socket notifications from the module.
     * @async
     * @override
     *
     * @param {string} notification - Notification name
     * @param {*} payload - Detailed payload of the notification.
     *
     * @returns {void}
     */
    async socketNotificationReceived(notification, payload) {
        if (notification === "CHECK_HOSTS") {
            if (payload.length === 0) {
                Log.log("No hosts to ping");
                this.sendSocketNotification("STATUS_UPDATE", status);
            } else {
                Log.log("Pinging " + payload.length + " hosts");
                const status = [];

                // Ensure to make all ping requests in parallel
                await Promise.all(
                    payload.map(async (h, i) => {
                        let online = false;
                        try {
                            const { alive } = await ping.promise.probe(h.host, {
                                timeout: h.timeout,
                            });
                            online = alive;
                            // eslint-disable-next-line no-empty
                        } catch (err) {}

                        status.push({ online, ...h, index: i });
                    })
                );

                status.sort((a, b) => a.index - b.index);
                Log.log(
                    "Received ping statuses for " +
                        status.length +
                        "hosts. Rescheculing for the next " +
                        status[0].updateInterval +
                        " seconds."
                );
                this.sendSocketNotification("STATUS_UPDATE", status);
            }
        }
    },
});
