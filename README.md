# Getting started  

To build this project, do   
`npm install` & `webpack -p`   
If there are errors with fetching the npm modules, you might need to go into the individual package.json files inside the node modules that complain   

Issues with installing node modules: int64-buffer, js-file-download, react-contextmenu needs to be installed explicitly
so after doing 'npm install' do 'sudo npm install --save int64-buffer react-contextmenu js-file-download'

On maaxboard for Checkweigher: 
in setvlan.sh, add following line: 'sudo /usr/bin/node /home/myuser/node/localserver.js 80 eth0.1 &'

On Pi:
in /etc/init.d/fti-touchscreen.sh, the following lines should be present:

pushd /home/myuser

sudo node /home/myuser/node/usb.js &

sudo node /home/myuser/node/display.js 3300 eth0 &

popd

sleep 7

sudo -u myuser chromium --gpu-no-context-lost --enable-gpu-rasterization --start-fullscreen --kiosk --no-first-run --incognito http://localhost:3300/iframe.html > /dev/null 2>&1 &



