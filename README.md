# Basilica.ai Test App

Built to test the https://basilica.ai API.

Searches for words and Flickr and classifies the top photos.

For example, books, tractors and suns:

![demo](demo.gif)

## Build

```
npm install
npx webpack
# edit nginx configuration to point to correct `dist' and `logs' folder
nginx -p .
start http://localhost:4000/#planes,trains,automobiles
```
