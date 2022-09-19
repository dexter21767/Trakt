#!/bin/sh

set -e

cd vue
npm run build
cd ../
git add --all
git commit -am "Deploy"
git push origin main
git push beamup main
