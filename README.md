# Event Seat Booking

The following service supporting a busy online reservation system using NodeJS, Redis and Docker.  Locking has been implemented for concurrent attempts to hold seats due to this business.  Events have been modeled as collections of seats and are decoupled from these locks should a move to a database (SQL or noSQL) more suitable be required.

## API
The following routes all require an x-user-id to be sent along with the requests.  In practise, some authorisation & authentication controls would be needed here.

### create event POST /events
Accepts a JSON body, NUM_SEATS must be an integer between 10 & 1000.
```
curl --location 'localhost:3000/events' \
--header 'x-user-id: <USER_ID>' \
--header 'Content-Type: application/json' \
--data '{
    "numSeats": <NUM_SEATS>
}'
```

### list seats for event GET /events/<EVENT_ID>
For a given event list free seats, not held or reserved.
```
curl --location 'localhost:3000/events/8f1cbe5c-9e21-42f4-979a-ac3692b608c1/seats' \
--header 'x-user-id: <USER_ID>'
```

### hold a seat PATCH /events/<EVENT_ID>/seats/<SEAT_ID>/hold
Hold a seat prior to reservation for a configurable duration.  
If the seat is already held by that user, it will refresh.
The maximum number of seats a user can hold is configurable, defaulting to 3. This includes held seats that are then reserved.
```
curl --location --request PATCH 'localhost:3000/events/<EVENT_ID>/seats/<SEAT_ID>/hold' \
--header 'x-user-id: foo'
```

### reserve a seat PATCH /events/<EVENT_ID>/seats/<SEAT_ID>/reserve
reserve a seat that the user currently holds
```
curl --location --request PATCH 'localhost:3000/events/<EVENT_ID>/seats/<SEAT_ID>/reserve' \
--header 'x-user-id: foo'
```

## running the application

### build
```
npm i && npm run build && docker compose build
```

### starting the application
```
docker compose up
```

### tests
```
npm t
```

### linting
```
npm run lint
```