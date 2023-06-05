#!/bin/bash
# sudo su
if [ ! -d "SAE_int" ]; then
    echo "Clonando repositorio de SAE_int"
    git clone https://github.com/Arquisoft-2023/SAE_int.git
    cd SAE_int
    echo "APIPORT=80
APIURI=http://sae_ag

CONSUMEURI=https://nginx-soap-t2ngntgfya-uc.a.run.app
" > .env
cd ..
fi
cd SAE_int
git pull
docker-compose down
docker rmi sae_int:latest
docker-compose up -d


