# Payment Service

Payment API to integrate a car wash service as a project for Engeneering and Management Services course.

Dependencies:

# fastapi & stripe for server implementation
pip install fastapi
pip install uvicorn

pip3 install --upgrade stripe
or
pip install stripe

# command to start the fastapi server on port 8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload


# web app dependencies
npm install -g live-server


# command to start client on port 8080
cd ./client
live-server