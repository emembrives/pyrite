#!/usr/bin/env node

import express from 'express'

import http from 'http'
import httpProxy from 'http-proxy'
import {initMiddleware} from './lib/middleware.js'
import path from 'path'
import rc from 'rc'
import winston from 'winston'
import {verifyConfig, verifySFU} from './lib/sanity.js'

const settings = rc('pyrite', {
    listen: {
        host: '0.0.0.0',
        port: 3030,
    },
    logger: {
        level: 'info',
        transports: ['console'],  // valid options are: console, file
    },
    session: {
        cookie: {maxAge: 1000 * 60 * 60 * 24}, // One day
        resave: false,
        saveUninitialized:true,
    },
    sfu: {
        path: null,
        url: 'http://localhost:8443',
    },
})

delete settings._

const logFormat = winston.format.printf(({level, message, timestamp}) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
})

const app = express()
const proxy = httpProxy.createProxyServer({
    target: settings.sfu.url,
})
const server = http.createServer(app)

app.config = {
    path:  {
        base: path.join(path.dirname(import.meta.url).replace('file://', ''), '..'),
    },
}
app.logger = winston.createLogger({
    colorize: true,
    format: winston.format.json(),
    level: settings.logger.level,
})

if (settings.logger.transports.includes('console')) {
    app.logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            logFormat,
        ),
        level: 'debug',
    }))
    app.logger.info('console logger added')
}

if (settings.logger.transports.includes('file')) {
    app.logger.info('file logger added')
    app.logger.add(new winston.transports.File({filename: 'pyrite.log'}))
}

app.settings = settings

;(async() => {
    await verifyConfig(app)
    await verifySFU()

    initMiddleware()

    server.listen(settings.listen.port, settings.listen.host, () => {
        app.logger.info(`listening host: ${settings.listen.host}:${settings.listen.port}`)

        if (process.env.PYRITE_NO_SECURITY) {
            app.logger.warn('SESSION SECURITY IS DISABLED')
        }
    })

    server.on('upgrade', (req, socket, head) => {
        proxy.ws(req, socket, head)
    })
})()

export default app
