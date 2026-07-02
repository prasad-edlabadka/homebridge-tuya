const assert = require('assert');
const discovery = require('../lib/TuyaDiscovery');

const {
    getDiscoveryCandidatePayloads,
    parseDiscoveryPayloads
} = discovery._internals;

const DEVICE_ID = 'bf608ab0a473c4636ehsg0';
const GOOD_PAYLOAD = JSON.stringify({
    ip: '192.168.1.44',
    gwId: DEVICE_ID,
    version: '3.3',
    productKey: 'abc123',
    encrypt: true
});
const TRUNCATED_PAYLOAD = '{"ip":"192.168.1.44","gwId":"' + DEVICE_ID + '","version":"3.3","productKey":"abc123","encrypt":true,"broken":"unterminated';

function testNormalDiscoveryPayload() {
    const candidates = getDiscoveryCandidatePayloads(GOOD_PAYLOAD, GOOD_PAYLOAD);
    const parsed = parseDiscoveryPayloads(candidates);

    assert.strictEqual(parsed.recovered, false);
    assert.strictEqual(parsed.result.gwId, DEVICE_ID);
    assert.strictEqual(parsed.result.ip, '192.168.1.44');
    assert.strictEqual(parsed.result.version, '3.3');
}

function testRecoveredDiscoveryPayload() {
    const candidates = getDiscoveryCandidatePayloads(TRUNCATED_PAYLOAD, TRUNCATED_PAYLOAD);
    const parsed = parseDiscoveryPayloads(candidates);

    assert.strictEqual(parsed.recovered, true);
    assert.strictEqual(parsed.result.gwId, DEVICE_ID);
    assert.strictEqual(parsed.result.ip, '192.168.1.44');
    assert.strictEqual(parsed.result.version, '3.3');
    assert.strictEqual(parsed.result.encrypt, true);
}

function testRecoveredPayloadFollowsDiscoverAndEndPath(done) {
    const parsed = parseDiscoveryPayloads(getDiscoveryCandidatePayloads(TRUNCATED_PAYLOAD, TRUNCATED_PAYLOAD));
    const events = [];

    discovery.removeAllListeners();
    discovery.discovered.clear();
    discovery.limitedIds.splice(0, discovery.limitedIds.length, DEVICE_ID);
    discovery.log = {
        debug() {},
        info() {},
        error() {},
        warn() {}
    };

    discovery.on('discover', data => events.push({type: 'discover', data}));
    discovery.on('end', () => {
        events.push({type: 'end'});

        assert.strictEqual(events[0].type, 'discover');
        assert.strictEqual(events[0].data.id, DEVICE_ID);
        assert.strictEqual(events[0].data.ip, '192.168.1.44');
        assert.strictEqual(events[1].type, 'end');
        assert.strictEqual(discovery.discovered.size, 0);
        done();
    });

    discovery._onDiscover(parsed.result);
}

testNormalDiscoveryPayload();
testRecoveredDiscoveryPayload();
testRecoveredPayloadFollowsDiscoverAndEndPath(err => {
    if (err) throw err;
});
