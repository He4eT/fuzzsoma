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

download(channelsUrl)
  .then(xml2js.parseStringPromise)
  .then((json) => json.channels.channel)
  .then((channels) => channels.map((channel) => ({
    name: `${channel.title[0]} — ${channel.description[0]}`,
    value: channel.highestpls[0]['_'],
  })))
  .then(fuzzySelect)
  .then((x) => console.log(x))
  .catch((error) => console.error('Error:', error.message))
