/*
 *  Created By JD.Francis on 11/15/18
 */

// to.js
export default function wait(promise) {
    return promise.then(data => {
        return [null, data];
    })
        .catch(err => [err]);
}