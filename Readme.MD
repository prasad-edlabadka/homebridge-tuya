<p align="center">
    <img src="https://raw.githubusercontent.com/palasinio/homebridge-tuya/main/assets/Tuya-Plugin-Branding.png" height="100"><br>
</p>


<span align="center">

# Homebridge-Tuya

[![npm](https://img.shields.io/npm/v/homebridge-tuya.svg)](https://www.npmjs.com/package/homebridge-tuya)
[![npm](https://img.shields.io/npm/dt/homebridge-tuya.svg)](https://www.npmjs.com/package/homebridge-tuya)
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)


</span>



Control your supported Tuya accessories locally in HomeKit

This fork includes Homebridge 2 compatibility fixes for cached accessories, malformed Tuya LAN discovery payloads, automatic sanitizing of invalid HomeKit accessory names, and Tuya 3.3 Outlet startup/write-state handling.

Fork transparency: the `palasinio/homebridge-tuya` fork maintenance and compatibility fixes in versions 3.1.2 through 3.1.5 were developed with Codex assistance and reviewed in the local repository before release.

* [Supported Device Types](#supported-device-types)
* [Installation Instructions](#installation-instructions)
* [Configuration](#configuration)
* [Known Issues](#known-issues)
* [Troubleshooting](#troubleshooting)
* [Credits](#credits)
* [License](#license)
* [Donating](#donating)

## Supported Device Types
> Click the number next to your device to find the possible DataPoint "DP" values, then add as needed to your config.

* Air Conditioner<sup>[1](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types#air-conditioners)</sup> 
* Air Purifiers<sup>[2]()</sup>
* Convectors<sup>[3](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types#heat-convectors)</sup>
* Dehumidifers<sup>[4](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types)</sup>
* Dimmers<sup>[5](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types#simple-dimmers)</sup>
* Fan<sup>[6](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types)</sup>
* Fan v2<sup>[7](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types)</sup>
* Garages<sup>[8](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types#garage-doors)</sup>
* Heaters<sup>[9](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types)</sup>
* Lights
  * On/Off<sup>[10](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types)</sup>
  * Brightness<sup>[11](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types#tunable-white-light-bulbs)</sup>
  * Color<sup>[12](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types#white-and-color-light-bulbs)</sup> (Hue, Saturation, Adaptive Lighting)
* Oil Diffusers<sup>[13](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types)</sup>
* Outlets<sup>[14](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types#outlets)</sup>
* Switches<sup>[15](https://github.com/iRayanKhan/homebridge-tuya/wiki/Supported-Device-Types)</sup>

Note: Motion, and other sensor types don't behave well with responce requests, so they will not be added. 


## Installation Instructions

#### Option 1: Install via Homebridge Config UI X:

Search for "Tuya" in [homebridge-config-ui-x](https://github.com/oznu/homebridge-config-ui-x) and install `homebridge-tuya`.

#### Option 2: Manually Install:

```
sudo npm install -g homebridge-tuya
```

## Compatibility

* Homebridge `^1.8.0 || ^2.0.0-beta.0`
* Node.js `>=18`
* Node.js 22 LTS is recommended for Homebridge 2.x installs. Node.js 24 is not explicitly tested by this fork.
* Tuya 3.3 devices with malformed UDP discovery payloads are handled more defensively than in the upstream 3.1.1 release.
* Version 3.1.3 specifically targets a Homebridge 2.1.x / HAP 2.x behavior issue observed with Tuya 3.3 Outlets where discovery succeeded but cached Outlet controls could remain unavailable or non-writable.

## Configuration
> UI

1. Navigate to the Plugins page in [homebridge-config-ui-x](https://github.com/oznu/homebridge-config-ui-x).
2. Click the **Settings** button for the Tuya plugin.
3. Add your device types
4. Add device parameters<sup>[10](apple.com/)</sup>
5. Restart Homebridge for the changes to take effect.

> Manual

1. Edit the config.json file to add your device types, and parameters. 
2. Restart Homebridge


## Known Issues

1. If your devices add, but you can't control them, make sure you entered the DataPoint "DP" values for your device. 

## Troubleshooting
1. Make sure the plugin is up-to date
2. Check for existing issues

### Homebridge 2.x Tuya 3.3 Outlet startup

For a healthy Tuya 3.3 Outlet startup, the log should progress through these markers:

```text
Discovered ... identified as Outlet (3.3)
Discovery ended.
Connected to ...
Ready to handle ... (Outlet:3.3) with signature ...
```

If you see:

```text
Recovered malformed discovery payload ...
```

without later `Connected to ...` and `Ready to handle ...` lines, the device was discovered but did not complete the connect/state path. Check the configured device IP, local key, network reachability from the Homebridge host, and whether the device is already holding another local LAN connection.

Socket messages such as `ECONNRESET`, `ERR_PING_TIMED_OUT`, `ENETUNREACH`, `EHOSTUNREACH`, or `ERR_CONNECTION_TIMED_OUT` indicate the plugin is retrying the Tuya LAN socket after discovery. These are connect-path failures, not HomeKit name or cached-accessory restore failures.

For Homebridge 2.x child bridges, a cached accessory may first be marked unreachable during restore. Version 3.1.4 registers Outlet handlers from the base socket connect path, before `_connect()` can emit, and normalizes the initial `On` / `OutletInUse` state to booleans so the Outlet can recover once the Tuya device connects and reports state.


## Contributing

If you have new accessory logic for a new device, please add a function defined by manufacturer, and describe your changes in the readME file. 

## Credits

* [AMoo-Miki](https://github.com/AMoo-Miki) - developer of the [Tuya-Lan](https://github.com/AMoo-Miki/homebridge-tuya-lan) plugin which this plugin is based off. 
* mxDanger - Plugin branding.
* [CodeTheWeb](https://github.com/CodeTheWeb) - developer of [TuyaApi](https://github.com/codetheweb/tuyapi), who gratiously provided this repo's name.
* [Oznu](https://github.com/oznu) - developer of Homebridge, added ```config.schema.json``` , fixed dependencies, and helped inspire this readME off his [gsh](https://github.com/oznu/homebridge-gsh) plugin.

## License



## Donating

Please donate to a local pet shelter, or food pantry. It's been a wild time, but we can do our part by helping others. 
