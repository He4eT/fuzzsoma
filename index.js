#!/usr/bin/env node

const { exec } = require('child_process')
const inquirer = require('inquirer')
const inquirerSearchList = require('inquirer-search-list')
const xml2js = require('xml2js')

const CHANNELS_XML_URL = 'https://somafm.com/channels.xml'

const downloadChannelsXML = (url) =>
  fetch(url)
  .then((response) => {
    if (response.ok) {
      return response.text()
    } else {
      throw new Error([
        'Failed to download XML:',
        response.status,
        response.statusText,
      ].join(' '))
    }
  })

const extractChannels = (json) =>
  json.channels.channel

const sortChannels = (channels) =>
  channels.sort((a, b) => b.listeners[0] - a.listeners[0])

const shapeChannels = (channels) =>
  channels.map((channel) => ({
    name: `${channel.title[0]} — ${channel.description[0]}`,
    value: channel.highestpls[0]['_'],
  }))

const fuzzySelect = (choices) =>
  inquirer.prompt([{
    choices,
    message: 'SomaFM Channel:',
    name: 'channelURL',
    type: 'search-list',
  }])

const playChannel = ({channelURL}) =>
  exec(`cvlc ${channelURL}`)

/* */

inquirer.registerPrompt('search-list', inquirerSearchList)

downloadChannelsXML(CHANNELS_XML_URL)
  .then(xml2js.parseStringPromise)
  .then(extractChannels)
  .then(sortChannels)
  .then(shapeChannels)
  .then(fuzzySelect)
  .then(playChannel)
  .catch((error) => console.error('[Error]', error.message))
