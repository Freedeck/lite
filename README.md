# Freedeck Lite

Freedeck Lite is a project to test what the bare minimum Freedeck needs to be able to fully run.

## Current Features

- Connect, Companion, and Client all are able to connect to the server.
- Profiling based on events
- Custom brand/titling in some places

## Compilation based on 6.0.0d-rc3

You may need to update some components like the WebUI or eventNames.js file, as they will be frozen in time. Yes it is a little bit sloppy of me to include the webpack compilation but trust

Wanna grab the timed event-bus with some stats? Go to
`server:5754/lite/event-bus` and it will output the JSON of the event-bus mapping.

## Modifications

The Lite client has only been modified to remove my.freedeck.app support.
