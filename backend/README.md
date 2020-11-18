## Installation dependencies

```bash
$ npm install
```

## Build the app
```bash
$ npm run build 
```

## Running the app

```bash
# create .env file
$ cp dev.env .env

# edit .env with proper config

$ npm run start:prod
```

## Instead of building in normal way 

 You can also using docker
 
```bash
# first we build image from source
$ docker build -t docxverification

# create .env file
$ cp dev.env .env

# edit .env with proper config

# then run
$ docker run -p 3000:300 --env-file .env docxverification

```


