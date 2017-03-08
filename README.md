To build this project, do   
`npm install` & `webpack -p`   
If there are errors with fetching the npm modules, you might need to go into the individual package.json files inside the node modules that complain   

react-material-ui-keyboard has been complaining that it requires react 15.0.0. To resolve this, change 
"react": "15.0.0" -> "^15.4.2",  
"react-dom": "15.0.0" -> "^15.4.2",  
"react-tap-event-plugin": "1.0.0" -> "^2.0.1"   
This may feel like a bit of a hack, but it clears up all the problems related to peerDependencies.

To run, do `node server.js` and go to http://localhost:3300.


