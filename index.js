#!/usr/bin/env node

const xml2js = require('xml2js')
const inquirer = require('inquirer')
inquirer.registerPrompt('search-list', require('inquirer-search-list'))

const channelsUrl = 'https://somafm.com/channels.xml'

const downloadChannelsXML = (url) =>
  fetch(url)
  .then((response) => {
    if (response.ok) {
      return response.text()
    } else {
      throw new Error(`Failed to download XML. Status: ${response.status} ${response.statusText}`)
    }
  })

const extractChannels = (json) =>
  json.channels.channel

const fuzzySelect = (choices) =>
  inquirer.prompt([{
    type: "search-list",
    message: "Select SomaFM channel",
    name: "channel",
    choices,
  }])

const sortChannels = (channels) =>
  channels.sort((a, b) =>
    b.listeners[0] - a.listeners[0]
  )

const shapeChannels = (channels) =>
  channels.map((channel) => ({
    name: `${channel.title[0]} — ${channel.description[0]}`,
    value: channel.highestpls[0]['_'],
  }))

const playChannel = ({channel}) => {
  console.log(channel)
}

downloadChannelsXML(channelsUrl)
  .then(xml2js.parseStringPromise)
  .then(extractChannels)
  .then(sortChannels)
  .then(shapeChannels)
  .then(fuzzySelect)
  .then(playChannel)
  .catch((error) => console.error('Error:', error.message))
