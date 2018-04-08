# gitnode
Small auto deployment tool

## Requirement ##
NodeJS

pm2

git

## Installation ##
```bash
git clone https://github.com/mcflythekid/gitnode
node gitnode.js
```

or
```bash
git clone https://github.com/mcflythekid/gitnode
pm2 start gitnode.js
```


## Config ##
1. Setup a webhook on your github project
2. Add repository to: ./conf/repo.js (with secret phrase)
3. You can add an post-pull script in to ./script directory
