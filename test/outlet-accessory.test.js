const assert = require('assert');
const EventEmitter = require('events');
const OutletAccessory = require('../lib/OutletAccessory');

const Characteristics = {
    On: {UUID: 'on', displayName: 'On'},
    OutletInUse: {UUID: 'outlet-in-use', displayName: 'OutletInUse'},
    Name: {UUID: 'name', displayName: 'Name'}
};

class MockCharacteristic {
    constructor(type) {
        this.type = type;
        this.UUID = type.UUID;
        this.displayName = type.displayName;
        this.value = undefined;
        this.handlers = {};
        this.props = {perms: ['pr', 'pw', 'ev']};
    }

    updateValue(value) {
        this.value = value;
        return this;
    }

    setValue(value) {
        this.value = value;
        return this;
    }

    on(event, handler) {
        this.handlers[event] = handler;
        return this;
    }
}

class MockService {
    constructor() {
        this.displayName = 'Outdoor Smart plug Wi Fi BLE';
        this.UUID = 'outlet-service';
        this.characteristics = [];
    }

    getCharacteristic(type) {
        let characteristic = this.characteristics.find(item => item.UUID === type.UUID);
        if (!characteristic) {
            characteristic = new MockCharacteristic(type);
            this.characteristics.push(characteristic);
        }
        return characteristic;
    }

    addCharacteristic(type) {
        return this.getCharacteristic(type);
    }

    removeCharacteristic(characteristic) {
        this.characteristics = this.characteristics.filter(item => item !== characteristic);
    }
}

class MockAccessory extends EventEmitter {
    constructor(service) {
        super();
        this.service = service;
    }

    getService() {
        return this.service;
    }
}

class SyncConnectDevice extends EventEmitter {
    constructor() {
        super();
        this.context = {
            name: 'Outdoor Smart plug Wi Fi BLE',
            type: 'Outlet',
            version: '3.3'
        };
        this.state = {};
        this.connected = true;
        this.connectCalled = false;
    }

    _connect() {
        this.connectCalled = true;
        this.emit('connect');
    }
}

const logMessages = [];
const log = function() {};
log.debug = message => logMessages.push(message);

const service = new MockService();
const accessory = new MockAccessory(service);
const device = new SyncConnectDevice();
const platform = {
    log,
    api: {
        hap: {
            Service: {Outlet: {UUID: 'outlet-service'}},
            Characteristic: Characteristics,
            EnergyCharacteristics: {
                Volts: {UUID: 'volts'},
                Amperes: {UUID: 'amps'},
                Watts: {UUID: 'watts'}
            }
        }
    },
    registerPlatformAccessories() {}
};

new OutletAccessory(platform, accessory, device, false);

const on = service.getCharacteristic(Characteristics.On);
const outletInUse = service.getCharacteristic(Characteristics.OutletInUse);

assert.strictEqual(device.connectCalled, true);
assert.strictEqual(on.value, false);
assert.strictEqual(outletInUse.value, false);
assert.strictEqual(typeof on.handlers.get, 'function');
assert.strictEqual(typeof on.handlers.set, 'function');
assert.strictEqual(typeof outletInUse.handlers.get, 'function');
assert.ok(logMessages.some(message => message.includes('Registering Outlet handlers')));
