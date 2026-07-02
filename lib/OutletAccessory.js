const BaseAccessory = require('./BaseAccessory');

class OutletAccessory extends BaseAccessory {
    static getCategory(Categories) {
        return Categories.OUTLET;
    }

    _registerPlatformAccessory() {
        const {Service} = this.hap;

        this.accessory.addService(Service.Outlet, this.device.context.name);

        super._registerPlatformAccessory();
    }

    _onDeviceConnect() {
        if (!this._didRegisterCharacteristics) {
            this.log.debug(`Registering Outlet handlers for ${this.device.context.name} on connect.`);
            this._registerCharacteristics(this.device.state || {});
        }
    }

    getPowerState(callback) {
        this.getState(this.dpPower, (err, value) => {
            if (err) return callback(err);
            callback(null, this._coerceBoolean(value));
        });
    }

    _registerCharacteristics(dps) {
        if (this._didRegisterCharacteristics) return;
        this._didRegisterCharacteristics = true;

        const {Service, Characteristic, EnergyCharacteristics} = this.hap;
        const service = this.accessory.getService(Service.Outlet);
        this._checkServiceName(service, this.device.context.name);

        this.dpPower = this._getCustomDP(this.device.context.dpPower) || '1';
        this.log.debug(`Registering Outlet characteristics for ${this.device.context.name} using power DP ${this.dpPower}.`);

        const energyKeys = {
            volts: this._getCustomDP(this.device.context.voltsId),
            voltsDivisor: parseInt(this.device.context.voltsDivisor) || 10,
            amps: this._getCustomDP(this.device.context.ampsId),
            ampsDivisor: parseInt(this.device.context.ampsDivisor) || 1000,
            watts: this._getCustomDP(this.device.context.wattsId),
            wattsDivisor: parseInt(this.device.context.wattsDivisor) || 10
        };

        let characteristicVolts;
        if (energyKeys.volts) {
            characteristicVolts = service.getCharacteristic(EnergyCharacteristics.Volts)
                .updateValue(this._getDividedState(dps[energyKeys.volts], energyKeys.voltsDivisor))
                .on('get', this.getDividedState.bind(this, energyKeys.volts, energyKeys.voltsDivisor));
        } else this._removeCharacteristic(service, EnergyCharacteristics.Volts);

        let characteristicAmps;
        if (energyKeys.amps) {
            characteristicAmps = service.getCharacteristic(EnergyCharacteristics.Amperes)
                .updateValue(this._getDividedState(dps[energyKeys.amps], energyKeys.ampsDivisor))
                .on('get', this.getDividedState.bind(this, energyKeys.amps, energyKeys.ampsDivisor));
        } else this._removeCharacteristic(service, EnergyCharacteristics.Amperes);

        let characteristicWatts;
        if (energyKeys.watts) {
            characteristicWatts = service.getCharacteristic(EnergyCharacteristics.Watts)
                .updateValue(this._getDividedState(dps[energyKeys.watts], energyKeys.wattsDivisor))
                .on('get', this.getDividedState.bind(this, energyKeys.watts, energyKeys.wattsDivisor));
        } else this._removeCharacteristic(service, EnergyCharacteristics.Watts);
        
        const powerValue = this._coerceBoolean(dps[this.dpPower]);
        if (typeof dps[this.dpPower] === 'undefined') {
            this.log.debug(`Initial Outlet power state for ${this.device.context.name} is missing; initializing HomeKit On as ${powerValue}.`);
        } else {
            this.log.debug(`Initial Outlet power state for ${this.device.context.name} is ${dps[this.dpPower]}; initializing HomeKit On as ${powerValue}.`);
        }
        const characteristicOn = service.getCharacteristic(Characteristic.On)
            .updateValue(powerValue)
            .on('get', this.getPowerState.bind(this))
            .on('set', this.setState.bind(this, this.dpPower));
        const characteristicOutletInUse = service.getCharacteristic(Characteristic.OutletInUse)
            .updateValue(powerValue)
            .on('get', this.getPowerState.bind(this));

        this.device.on('change', changes => {
            if (changes.hasOwnProperty(this.dpPower)) {
                const newPowerValue = this._coerceBoolean(changes[this.dpPower]);
                if (characteristicOn.value !== newPowerValue) characteristicOn.updateValue(newPowerValue);
                if (characteristicOutletInUse.value !== newPowerValue) characteristicOutletInUse.updateValue(newPowerValue);
            }
            
            if (changes.hasOwnProperty(energyKeys.volts) && characteristicVolts) {
                const newVolts = this._getDividedState(changes[energyKeys.volts], energyKeys.voltsDivisor);
                if (characteristicVolts.value !== newVolts) characteristicVolts.updateValue(newVolts);
            }

            if (changes.hasOwnProperty(energyKeys.amps) && characteristicAmps) {
                const newAmps = this._getDividedState(changes[energyKeys.amps], energyKeys.ampsDivisor);
                if (characteristicAmps.value !== newAmps) characteristicAmps.updateValue(newAmps);
            }

            if (changes.hasOwnProperty(energyKeys.watts) && characteristicWatts) {
                const newWatts = this._getDividedState(changes[energyKeys.watts], energyKeys.wattsDivisor);
                if (characteristicWatts.value !== newWatts) characteristicWatts.updateValue(newWatts);
            }
        });
    }
}

module.exports = OutletAccessory;
