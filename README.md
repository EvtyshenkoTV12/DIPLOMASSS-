# diplom andrew yevtushenko

cd diplomasss
./npm install
./npm run dev

docker compose -f docker-compose-local.yml up -d

## in docker:

docker run -it -p 28000:27017 --name mongoContainer mongo:latest mongosh

this usues for db

in future i`m planed to united all containers 

