const assert = require('assert');
const EventEmitter = require('events');
const Module = require('module');

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
    if (request === 'async') {
        return {
            queue() {
                return {push() {}};
            }
        };
    }

    return originalLoad.apply(this, arguments);
};

const register = require('../index');

class PlatformAccessory extends EventEmitter {
    constructor(displayName, UUID, category) {
        super();
        this.displayName = displayName;
        this.UUID = UUID;
        this.category = category;
        this.services = [];
    }

    getService() {
        const service = this.services[0];
        if (service) return service;

        return {
            setCharacteristic() {
                return this;
            }
        };
    }

    addService(service, displayName) {
        const addedService = {
            UUID: service.UUID,
            displayName,
            characteristics: [],
            getCharacteristic() {
                return {
                    updateValue() {
                        return this;
                    },
                    on() {
                        return this;
                    },
                    setValue() {
                        return this;
                    }
                };
            }
        };
        this.services.push(addedService);
        return addedService;
    }
}

const log = function() {};
log.info = function() {};
log.warn = function() {};
log.error = function() {};
log.debug = function() {};

let RegisteredPlatform;

class Characteristic {}
Characteristic.Manufacturer = {};
Characteristic.Model = {};
Characteristic.SerialNumber = {};
Characteristic.Name = {};

register({
    platformAccessory: PlatformAccessory,
    hap: {
        Characteristic,
        Service: {
            AccessoryInformation: {UUID: 'accessory-information'},
            Outlet: {UUID: 'outlet'}
        },
        Accessory: {},
        Categories: {
            OUTLET: 7
        },
        uuid: {
            generate(value) {
                return value;
            }
        }
    },
    registerPlatform(pluginName, platformName, Platform) {
        RegisteredPlatform = Platform;
    }
});

const api = new EventEmitter();
api.hap = {
    Characteristic,
    Service: {
        Outlet: {UUID: 'outlet'}
    }
};
api.registerPlatformAccessories = function() {};
api.unregisterPlatformAccessories = function() {};

const platform = new RegisteredPlatform(log, {
    devices: [{
        id: 'bf608ab0a473c4636ehsg0',
        key: '0123456789abcdef',
        type: 'outlet',
        name: 'Outdoor Smart plug_Wi-Fi_BLE',
        fake: true
    }]
}, api);

const device = new EventEmitter();
device.context = {
    UUID: 'homebridge-tuya:fake:bf608ab0a473c4636ehsg0',
    id: 'bf608ab0a473c4636ehsg0',
    name: 'Outdoor Smart plug_Wi-Fi_BLE',
    type: 'outlet',
    version: '3.3',
    fake: true
};
device.state = {};
device._connect = function() {
    this.connected = true;
    this.emit('connect');
};

platform.addAccessory(device);

const accessory = platform.cachedAccessories.get(device.context.UUID);
assert.ok(accessory);
assert.strictEqual(accessory.accessory.category, 7);
