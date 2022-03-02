FROM node:lts
EXPOSE 5000
ENV PORT=5000
WORKDIR /client
COPY package*.json ./
RUN ["npm", "install"]
COPY . ./
CMD ["npm", "start"]