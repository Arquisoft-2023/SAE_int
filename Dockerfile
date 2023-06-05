FROM node:16-alpine

#Creat app directory
RUN mkdir -p sae/sae_int
WORKDIR /sae/sae_int

#Install app dependencies
COPY package*.json /sae/sae_int/
RUN npm install

#Bundle app source
COPY . /sae/sae_int/

EXPOSE 3037
EXPOSE 3036

CMD [ "npm", "run", "start" ]