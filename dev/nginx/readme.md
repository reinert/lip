## Setup local domains
`sudo setup.sh`

Add [api.,auth.]lip.local domains to /etc/hosts as loopbacks

## Start nginx service
It's included in docker-compose. At project's root run `docker-compose up`.

## Access local domains
In your browser enter `lip.local` in the address bar and see if it works

## Troubleshoot
- Cannot access local domains in chrome
  - https://superuser.com/a/723732
  - https://superuser.com/q/1241017
