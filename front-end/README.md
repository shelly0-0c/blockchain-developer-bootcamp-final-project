# In case you encountered ERROR

<mark>Failed to compile</mark>
```
./node_modules/nft.storage/src/platform.web.js
Module not found: Can't resolve 'ipfs-car/blockstore/memory' in '/Users/shelly/Documents/BlkC/consensys/blockchain-developer-bootcamp-final-project/front-end/node_modules/nft.storage/src'
```

Resolution:

1. Go to front-end/node_modules/nft.storage directory.

2. Make sure you have ipfs-car/dist/esm/blockstore and ipfs-car/dist/esm/pack. If not, install ipfs-car with yarn add ipfs-car. 

3. Copy ipfs-car/dist/esm to nft.storage/src.

4. Inside nft.storage/src, update the ipfs-car import statements in the following files like so:

    * Inside platform.web.js, update to this: import { MemoryBlockStore } from 'ipfs-car/dist/esm/blockstore/memory'
    * Inside lib.js, update to this: import { pack } from 'ipfs-car/dist/esm/pack'
    * Inside token.js, update to this: import { pack } from 'ipfs-car/dist/esm/pack'
    

5. Run `yarn start`, it should be working fine now.

Ref: https://stackoverflow.com/questions/70063600/cant-resolve-ipfs-car-blockstore-memory-when-importing-nft-storage




# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.



