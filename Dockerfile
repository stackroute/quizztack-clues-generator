FROM mhart/alpine-node-auto
RUN mkdir /clues-generator -p
WORKDIR /clues-generator
COPY package.json .
RUN npm install --production
COPY . .
CMD ["npm", "start", "--production"]
