# Reflex Web Map View
## prerequisites
- node.js
- git

## development
``` bash
git clone https://github.com/Bonuspunkt/reflexWebMapView.git
cd reflexWebMapView
npm install .
npm run-script watch
# if you have already a webserver installed, configure it to serve this directory
# else open a new terminal and change to the directory and run
npm install http-server -g
http-server
```

## production
```
npm run-script pack
# copy index.html & script.js to destination
```