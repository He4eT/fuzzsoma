#!/usr/bin/env node

const xml2js = require('xml2js')
const inquirer = require('inquirer')
inquirer.registerPrompt('search-list', require('inquirer-search-list'))

const channelsUrl = 'https://somafm.com/channels.xml'

const download = (url) =>
  fetch(url)
  .then((response) => {
    if (response.ok) {
      return response.text()
    } else {
      throw new Error(`Failed to download XML. Status: ${response.status} ${response.statusText}`)
    }
  })

const fuzzySelect = (choices) =>
  inquirer.prompt([{
    type: "search-list",
    message: "Select SomaFM channel",
    name: "channel",
    choices,
    pageSize: 10,
  }])

const playChannel = (channel) => {
  console.log(channel)
}

download(channelsUrl)
  .then(xml2js.parseStringPromise)
  .then((json) => json.channels.channel)
  .then((channels) => channels.sort((a, b) =>
    b.listeners[0] - a.listeners[0]))
  .then((channels) => channels.map((channel) => ({
    name: `${channel.title[0]} — ${channel.description[0]}`,
    value: channel.highestpls[0]['_'],
  })))
  .then(fuzzySelect)
  .then(({channel}) => channel)
  .then(playChannel)
  .catch((error) => console.error('Error:', error.message))
