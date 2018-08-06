# mashery-oauth-idp


## Building and Running the Mashery OAuth IDP

1) Build the container
```
docker build -t mashery/oauth-idp .
```

2) Run it
```
docker run -p 8080:8080 -d mashery/oauth-idp
```
