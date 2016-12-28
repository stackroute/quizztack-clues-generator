FROM mhart/alpine-node-auto
RUN mkdir /clueGenerator -p
WORKDIR /clueGenerator
COPY package.json .
RUN npm install --production
COPY . .
CMD ["npm", "start", "--production"]
