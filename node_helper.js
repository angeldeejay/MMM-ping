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
            const status = [];

            // Ensure to make all ping requests in parallel
            await Promise.all(
                payload.map(async (h, i) => {
                    const { alive } = await ping.promise.probe(h.host, {
                        timeout: h.timeout,
                    });

                    status.push({ online: alive, ...h, index: i });
                })
            );

            status.sort((a, b) => a.index - b.index);
            this.sendSocketNotification("STATUS_UPDATE", status);
        }
    },
});
