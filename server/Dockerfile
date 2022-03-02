FROM node:lts
ENV PORT=8080
EXPOSE 8080
WORKDIR /server
COPY package*.json ./
RUN ["npm", "install"]
COPY . ./
ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]