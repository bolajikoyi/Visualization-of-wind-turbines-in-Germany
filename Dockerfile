FROM yarnpkg/node-yarn

# RUN commands are executed inside the container
# RUN mkdir -p /home/app

# COPY commands are executed inside the host
COPY . .
COPY package.json .
RUN yarn install
RUN yarn build

# RUN yarn install

CMD yarn start


